(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.focusLock = factory());
}(this, function () { 'use strict';

  var toArray = function toArray(a) {
    var ret = Array(a.length);
    for (var i = 0; i < a.length; ++i) {
      ret[i] = a[i];
    }
    return ret;
  };

  var arrayFind = function arrayFind(array, search) {
    return array.filter(function (a) {
      return a === search;
    })[0];
  };

  var asArray = function asArray(a) {
    return Array.isArray(a) ? a : [a];
  };

  var tabSort = function tabSort(a, b) {
    var tabDiff = a.tabIndex - b.tabIndex;
    var indexDiff = a.index - b.index;

    if (tabDiff) {
      if (!a.tabIndex) return 1;
      if (!b.tabIndex) return -1;
    }

    return tabDiff || indexDiff;
  };

  var orderByTabIndex = function orderByTabIndex(nodes, filterNegative, keepGuards) {
    return toArray(nodes).map(function (node, index) {
      return {
        node: node,
        index: index,
        tabIndex: keepGuards && node.tabIndex === -1 ? (node.dataset || {}).focusGuard ? 0 : -1 : node.tabIndex
      };
    }).filter(function (data) {
      return !filterNegative || data.tabIndex >= 0;
    }).sort(tabSort);
  };

  var tabbables = ['button:enabled:not([readonly])', 'select:enabled:not([readonly])', 'textarea:enabled:not([readonly])', 'input:enabled:not([readonly])', 'a[href]', 'area[href]', 'iframe', 'object', 'embed', '[tabindex]', '[contenteditable]', '[autofocus]'];

  var FOCUS_GROUP = 'data-focus-lock';
  var FOCUS_DISABLED = 'data-focus-lock-disabled';
  var FOCUS_ALLOW = 'data-no-focus-lock';
  var FOCUS_AUTO = 'data-autofocus-inside';

  var queryTabbables = tabbables.join(',');
  var queryGuardTabbables = queryTabbables + ', [data-focus-guard]';

  var getFocusables = function getFocusables(parents, withGuards) {
    return parents.reduce(function (acc, parent) {
      return acc.concat(
      // add all tabbables inside
      toArray(parent.querySelectorAll(withGuards ? queryGuardTabbables : queryTabbables)),
      // add if node is tabble itself
      parent.parentNode ? toArray(parent.parentNode.querySelectorAll(tabbables.join(','))).filter(function (node) {
        return node === parent;
      }) : []);
    }, []);
  };

  var getParentAutofocusables = function getParentAutofocusables(parent) {
    var parentFocus = parent.querySelectorAll('[' + FOCUS_AUTO + ']');
    return toArray(parentFocus).map(function (node) {
      return getFocusables([node]);
    }).reduce(function (acc, nodes) {
      return acc.concat(nodes);
    }, []);
  };

  var isElementHidden = function isElementHidden(computedStyle) {
    if (!computedStyle || !computedStyle.getPropertyValue) {
      return false;
    }
    return computedStyle.getPropertyValue('display') === 'none' || computedStyle.getPropertyValue('visibility') === 'hidden';
  };

  var isVisible = function isVisible(node) {
    return !node || node === document || !isElementHidden(window.getComputedStyle(node, null)) && isVisible(node.parentNode);
  };

  var notHiddenInput = function notHiddenInput(node) {
    return !((node.tagName === 'INPUT' || node.tagName === 'BUTTON') && (node.type === 'hidden' || node.disabled));
  };

  var getParents = function getParents(node) {
    var parents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    parents.push(node);
    if (node.parentNode) {
      getParents(node.parentNode, parents);
    }
    return parents;
  };

  var getCommonParent = function getCommonParent(nodea, nodeb) {
    var parentsA = getParents(nodea);
    var parentsB = getParents(nodeb);

    for (var i = 0; i < parentsA.length; i += 1) {
      var currentParent = parentsA[i];
      if (parentsB.indexOf(currentParent) >= 0) {
        return currentParent;
      }
    }
    return false;
  };

  var filterFocusable = function filterFocusable(nodes) {
    return toArray(nodes).filter(function (node) {
      return isVisible(node);
    }).filter(function (node) {
      return notHiddenInput(node);
    });
  };

  var getTabbableNodes = function getTabbableNodes(topNodes, withGuards) {
    return orderByTabIndex(filterFocusable(getFocusables(topNodes, withGuards)), true, withGuards);
  };

  var getAllTabbableNodes = function getAllTabbableNodes(topNodes) {
    return orderByTabIndex(filterFocusable(getFocusables(topNodes)), false);
  };

  var parentAutofocusables = function parentAutofocusables(topNode) {
    return filterFocusable(getParentAutofocusables(topNode));
  };

  var isRadio = function isRadio(node) {
    return node.tagName === 'INPUT' && node.type === 'radio';
  };

  var findSelectedRadio = function findSelectedRadio(node, nodes) {
    return nodes.filter(isRadio).filter(function (el) {
      return el.name === node.name;
    }).filter(function (el) {
      return el.checked;
    })[0] || node;
  };

  var pickFirstFocus = function pickFirstFocus(nodes) {
    if (nodes[0] && nodes.length > 1) {
      if (isRadio(nodes[0]) && nodes[0].name) {
        return findSelectedRadio(nodes[0], nodes);
      }
    }
    return nodes[0];
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var filterNested = function filterNested(nodes) {
    var l = nodes.length;
    for (var i = 0; i < l; i += 1) {
      var _loop = function _loop(j) {
        if (i !== j) {
          if (nodes[i].contains(nodes[j])) {
            return {
              v: filterNested(nodes.filter(function (x) {
                return x !== nodes[j];
              }))
            };
          }
        }
      };

      for (var j = 0; j < l; j += 1) {
        var _ret = _loop(j);

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
    }
    return nodes;
  };

  var getTopParent = function getTopParent(node) {
    return node.parentNode ? getTopParent(node.parentNode) : node;
  };

  var getAllAffectedNodes = function getAllAffectedNodes(node) {
    var nodes = asArray(node);
    return nodes.filter(Boolean).reduce(function (acc, currentNode) {
      var group = currentNode.getAttribute(FOCUS_GROUP);
      acc.push.apply(acc, group ? filterNested(toArray(getTopParent(currentNode).querySelectorAll('[' + FOCUS_GROUP + '="' + group + '"]:not([' + FOCUS_DISABLED + '="disabled"])'))) : [currentNode]);
      return acc;
    }, []);
  };

  var findAutoFocused = function findAutoFocused(autoFocusables) {
    return function (node) {
      return !!node.autofocus || node.dataset && !!node.dataset.autofocus || autoFocusables.indexOf(node) >= 0;
    };
  };

  var newFocus = function newFocus(innerNodes, outerNodes, activeElement, lastNode, autoFocused) {
    var cnt = innerNodes.length;
    var firstFocus = innerNodes[0];
    var lastFocus = innerNodes[cnt - 1];

    // focus is inside
    if (innerNodes.indexOf(activeElement) >= 0) {
      return undefined;
    }

    var activeIndex = outerNodes.indexOf(activeElement);
    var lastIndex = outerNodes.indexOf(lastNode || activeIndex);
    var lastNodeInside = innerNodes.indexOf(lastNode);
    var indexDiff = activeIndex - lastIndex;
    var firstNodeIndex = outerNodes.indexOf(firstFocus);
    var lastNodeIndex = outerNodes.indexOf(lastFocus);

    // new focus
    if (activeIndex === -1 || lastNodeInside === -1) {
      return innerNodes.indexOf(autoFocused.length ? pickFirstFocus(autoFocused) : pickFirstFocus(innerNodes));
    }
    // old focus
    if (!indexDiff && lastNodeInside >= 0) {
      return lastNodeInside;
    }
    // jump out
    if (indexDiff && Math.abs(indexDiff) > 1) {
      return lastNodeInside;
    }
    // focus above lock
    if (activeIndex <= firstNodeIndex) {
      return cnt - 1;
    }
    // focus below lock
    if (activeIndex > lastNodeIndex) {
      return 0;
    }
    // index is inside tab order, but outside Lock
    if (indexDiff) {
      if (Math.abs(indexDiff) > 1) {
        return lastNodeInside;
      }
      return (cnt + lastNodeInside + indexDiff) % cnt;
    }
    // do nothing
    return undefined;
  };

  var getTopCommonParent = function getTopCommonParent(baseActiveElement, leftEntry, rightEntries) {
    var activeElements = asArray(baseActiveElement);
    var leftEntries = asArray(leftEntry);
    var activeElement = activeElements[0];
    var topCommon = null;
    leftEntries.filter(Boolean).forEach(function (entry) {
      topCommon = getCommonParent(topCommon || entry, entry) || topCommon;
      rightEntries.filter(Boolean).forEach(function (subEntry) {
        var common = getCommonParent(activeElement, subEntry);
        if (common) {
          if (!topCommon || common.contains(topCommon)) {
            topCommon = common;
          } else {
            topCommon = getCommonParent(common, topCommon);
          }
        }
      });
    });
    return topCommon;
  };

  var allParentAutofocusables = function allParentAutofocusables(entries) {
    return entries.reduce(function (acc, node) {
      return acc.concat(parentAutofocusables(node));
    }, []);
  };

  var notAGuard = function notAGuard(node) {
    return !(node.dataset && node.dataset.focusGuard);
  };

  var reorderNodes = function reorderNodes(srcNodes, dstNodes) {
    return srcNodes.map(function (dnode) {
      return dstNodes.find(function (_ref) {
        var node = _ref.node;
        return dnode === node;
      });
    }).filter(Boolean);
  };

  var getFocusMerge = function getFocusMerge(topNode, lastNode) {
    var activeElement = document && document.activeElement;
    var entries = getAllAffectedNodes(topNode).filter(notAGuard);

    var commonParent = getTopCommonParent(activeElement || topNode, topNode, entries);

    var innerElements = getTabbableNodes(entries).filter(function (_ref5) {
      var node = _ref5.node;
      return notAGuard(node);
    });

    if (!innerElements[0]) {
      innerElements = getAllTabbableNodes(entries).filter(function (_ref6) {
        var node = _ref6.node;
        return notAGuard(node);
      });
      if (!innerElements[0]) {
        return undefined;
      }
    }

    var outerNodes = getTabbableNodes([commonParent]).map(function (_ref7) {
      var node = _ref7.node;
      return node;
    });
    var orderedInnerElements = reorderNodes(outerNodes, innerElements);
    var innerNodes = orderedInnerElements.map(function (_ref8) {
      var node = _ref8.node;
      return node;
    });

    var newId = newFocus(innerNodes, outerNodes, activeElement, lastNode, innerNodes.filter(findAutoFocused(allParentAutofocusables(entries))));

    if (newId === undefined) {
      return newId;
    }
    return orderedInnerElements[newId];
  };

  var focusInFrame = function focusInFrame(frame) {
    return frame === document.activeElement;
  };

  var focusInsideIframe = function focusInsideIframe(topNode) {
    return !!arrayFind(toArray(topNode.querySelectorAll('iframe')), focusInFrame);
  };

  var focusInside = function focusInside(topNode) {
    var activeElement = document && document.activeElement;

    if (!activeElement || activeElement.dataset && activeElement.dataset.focusGuard) {
      return false;
    }
    return getAllAffectedNodes(topNode).reduce(function (result, node) {
      return result || node.contains(activeElement) || focusInsideIframe(node);
    }, false);
  };

  var focusIsHidden = function focusIsHidden() {
    return document && toArray(document.querySelectorAll('[' + FOCUS_ALLOW + ']')).some(function (node) {
      return node.contains(document.activeElement);
    });
  };

  var focusOn = function focusOn(target) {
    target.focus();
    if (target.contentWindow) {
      target.contentWindow.focus();
    }
  };

  var guardCount = 0;
  var lockDisabled = false;

  var setFocus = (function (topNode, lastNode) {
    var focusable = getFocusMerge(topNode, lastNode);

    if (lockDisabled) {
      return;
    }

    if (focusable) {
      if (guardCount > 2) {
        // eslint-disable-next-line no-console
        console.error('FocusLock: focus-fighting detected. Only one focus management system could be active. ' + 'See https://github.com/theKashey/focus-lock/#focus-fighting');
        lockDisabled = true;
        setTimeout(function () {
          lockDisabled = false;
        }, 1);
        return;
      }
      guardCount++;
      focusOn(focusable.node);
      guardCount--;
    }
  });

  var lastActiveTrap = 0;
  var lastActiveFocus = null;

  var focusOnBody = function focusOnBody() {
    return document && document.activeElement === document.body;
  };

  var isFreeFocus = function isFreeFocus() {
    return focusOnBody() || focusIsHidden();
  };

  var activateTrap = function activateTrap() {
    var result = false;

    if (lastActiveTrap) {
      var observed = lastActiveTrap;

      if (!isFreeFocus()) {
        if (observed && !focusInside(observed)) {
          result = setFocus(observed, lastActiveFocus);
        }

        lastActiveFocus = document.activeElement;
      }
    }

    return result;
  };

  var reducePropsToState = function reducePropsToState(propsList) {
    return propsList.filter(function (node) {
      return node;
    }).slice(-1)[0];
  };

  var handleStateChangeOnClient = function handleStateChangeOnClient(trap) {
    lastActiveTrap = trap;

    if (trap) {
      activateTrap();
    }
  };

  var instances = [];

  var emitChange = function emitChange(event) {
    if (handleStateChangeOnClient(reducePropsToState(instances))) {
      event && event.preventDefault();
      return true;
    }

    return false;
  };

  var attachHandler = function attachHandler() {
    document.addEventListener('focusin', emitChange);
  };

  var detachHandler = function detachHandler() {
    document.removeEventListener('focusin', emitChange);
  };

  var focusLock = {
    on: function on(domNode) {
      if (instances.length === 0) {
        attachHandler();
      }

      if (instances.indexOf(domNode) < 0) {
        instances.push(domNode);
        emitChange();
      }
    },
    off: function off(domNode) {
      instances = instances.filter(function (node) {
        return node !== domNode;
      });
      emitChange();

      if (instances.length === 0) {
        detachHandler();
      }
    }
  };

  return focusLock;

}));
