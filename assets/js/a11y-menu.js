function breakpointDebug() {
    var debugBox = document.createElement('div');
    debugBox.setAttribute("id", "debug-box");
    var createAfterBody = document.getElementsByTagName('body')[0];
    createAfterBody.parentNode.insertBefore(debugBox, createAfterBody);

    window.onload = function() {
        debugBox.innerHTML = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    };

    window.onresize = function() {
        debugBox.innerHTML = window.innerWidth;
    };
}
breakpointDebug();

/**
 * Element.closest() polyfill
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
 */
if (!Element.prototype.closest) {
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }
    Element.prototype.closest = function(s) {
        var el = this;
        var ancestor = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (ancestor.matches(s)) return ancestor;
            ancestor = ancestor.parentElement;
        } while (ancestor !== null);
        return null;
    };
}

window.a11ymenu = function() {
    return {
        init() {
            // Adds consistency across browsers for clicking buttons (https://zellwk.com/blog/inconsistent-button-behavior/)
            document.addEventListener('click', function(event) {
                if (event.target.matches('button')) {
                    event.target.focus()
                }
            });
            // Adding to the menu here to dynamically create x-spread. Won't work adding to init().
            var topLevelMenuLists = document.querySelectorAll('.a11ymenu__menu > li');
            topLevelMenuLists.forEach(function(topLevelMenuList) {
                topLevelMenuList.classList.add('menu--top-level');
            });

            var nestedMenuListContainers = document.querySelectorAll('.a11ymenu__menu ul')
            var nestedMenuLists = document.querySelectorAll('.a11ymenu__menu ul > li');
            var combinedMenuLists = Array.prototype.slice.call(topLevelMenuLists).concat(Array.prototype.slice.call(nestedMenuLists));

            combinedMenuLists.forEach(function(combinedMenuItem) {
                if (combinedMenuItem.querySelector('a, .separator')) {
                    allLinksandSeparators = combinedMenuItem.querySelector('a, .separator')
                    allLinksandSeparators.setAttribute("x-spread", "item");
                }
                if (combinedMenuItem.querySelector('ul')) {
                    combinedMenuItem.classList.add("has-submenu");
                    combinedMenuItem.setAttribute("aria-expanded", "false");
                    var menuItemLink = combinedMenuItem.querySelector('a, .separator');
                    var btn = '<button x-spread="item" aria-expanded="false"><span><span class="sr-only">Show submenu for “' + menuItemLink.text + '”</span></span></button>';
                    menuItemLink.insertAdjacentHTML('afterend', btn);

                    var menuItemSpans = combinedMenuItem.querySelectorAll('span.separator');
                    // If you don't want placeholders to gain focus then comment this out. 
                    // You won't be able to use arrow keys to go past the span though if you do.
                    if (menuItemSpans.length) {
                        menuItemSpans.forEach(function(menuItemSpan) {
                            menuItemSpan.setAttribute('tabindex', '0');
                        })
                    }
                }
            });

            nestedMenuListContainers.forEach(function(nestedMenuListContainer) {
                nestedMenuListContainer.classList.add("submenu-container");
                //nestedMenuListContainer.setAttribute("x-spread", "submenuContainer");
            });
        },
        isOpen: false,
        submenuOpen: false,
        burger: false,
        switchClass: {
            [':class']() {
                if (this.isOpen) {
                    return 'mobile--open'
                } else {
                    return 'mobile--closed'
                };
            },
        },
        burgerTrigger: {
            ['@click']() {
                {
                    this.isOpen !== true ? this.isOpen = true : this.isOpen = null
                }
            },
            ['x-on:keydown.escape.prevent']($event) {
                this.isOpen = false
            },
        },

        wrapNavigation: {
            ['x-bind:aria-expanded']() {
                return this.isOpen
            },
            ["@click.away"]($event) {
                this.submenuOpen = false;
                hasSubmenuList = this.$el.querySelectorAll('.submenu-open');
                if (hasSubmenuList) {
                    hasSubmenuList.forEach(function(submenuListItem) {
                        submenuListItem.classList.remove("submenu-open");
                        submenuListItem.setAttribute('aria-expanded', "false");
                    })
                }
                hasButton = this.$el.querySelectorAll('button[x-spread=item]');
                if (hasButton) {
                    hasButton.forEach(function(hasButtonItem) {
                        hasButtonItem.setAttribute('aria-expanded', "false");
                    })
                }
            }
        },

        item: {
            ['@click']($event) {
                var liContainer = $event.target.offsetParent;
                var liContainerAttr = liContainer.getAttribute('aria-expanded');
                var topLevelList = $event.target.closest(".menu--top-level");
                var closestLevelList = $event.target.closest(".has-submenu");

                // If clicking on top level button then close all open menus.
                if (($event.target == topLevelList.querySelector('button')) || ($event.target == topLevelList.querySelector('button>span'))) {
                    allButtons = this.$el.querySelectorAll('button');
                    if (allButtons !== null) {
                        allButtons.forEach(function(button) {
                            button.setAttribute('aria-expanded', "false");
                        })
                    }
                    allContainers = this.$el.querySelectorAll('.submenu-open');
                    if (allContainers !== null) {
                        allContainers.forEach(function(container) {
                            container.setAttribute('aria-expanded', "false");
                            container.classList.remove("submenu-open");
                        })
                    }
                }

                // If click and the container is set as aria-expanded=false then set it as true and add class.
                if (($event.target == closestLevelList.querySelector('button')) || ($event.target == closestLevelList.querySelector('button>span'))) {
                    if (liContainerAttr == 'false') {
                        this.submenuOpen = true;
                        liContainer.classList.add("submenu-open");
                        liContainer.setAttribute('aria-expanded', "true");
                        liContainer.querySelector('button').setAttribute('aria-expanded', "true");
                    } else {
                        this.submenuOpen = false;
                        liContainer.classList.remove("submenu-open");
                        liContainer.setAttribute('aria-expanded', "false");
                        liContainer.querySelector('button').setAttribute('aria-expanded', "false");
                    }
                }

                // Close sub-button and list container if top button is clicked
                if ($event.target.parentElement.nextElementSibling) {
                    lowerButtons = $event.target.parentElement.nextElementSibling.querySelectorAll('button');
                    if (lowerButtons !== null) {
                        lowerButtons.forEach(function(lowerButton) {
                            lowerButton.setAttribute('aria-expanded', "false");
                        })
                    }
                    lowerContainers = $event.target.parentElement.nextElementSibling.querySelectorAll('.submenu-open');
                    if (lowerContainers !== null) {
                        lowerContainers.forEach(function(lowerContainer) {
                            lowerContainer.setAttribute('aria-expanded', "false");
                            lowerContainer.classList.remove("submenu-open");
                        })
                    }
                }
            },

            ['x-on:keydown.arrow-right.prevent']($event) {
                var currentItem = $event.currentTarget;
                var next = $event.target.nextElementSibling; // Check to see if it's a button. Not used for next link.
                var nextContainer = $event.target.parentElement;

                if ((next !== null) && (next.matches('button'))) {
                    // If next item is a button
                    next.focus();
                } else if (currentItem.getAttribute('aria-expanded') === 'true') {
                    // If menu is open drop to first item
                    next.querySelector('[x-spread=item]').focus();
                } else if (nextContainer.nextElementSibling !== null) {
                    // If next item in list is a link or placeholder
                    nextContainer.nextElementSibling.querySelector('[x-spread=item]').focus();
                } else {
                    // Else return focus to start of current submenu (focus trapping)
                    currentItem.closest('ul').querySelector('[x-spread=item]').focus();
                }
            },

            ['x-on:keydown.arrow-left.prevent']($event) {
                var currentItem = $event.currentTarget;
                var previous = $event.target.previousElementSibling; // Check to see if it's a button. Not used for next link.
                var currentContainer = $event.target.parentElement;
                var previousContainer = currentContainer.previousElementSibling;

                if (previous !== null) {
                    // If there is a previous item in this list item
                    previous.focus();
                } else if (previousContainer !== null) {
                    // If there is a list item before then focus on the last item. Focus on button first, then link
                    if (previousContainer.querySelector('button') !== null) {
                        previousContainer.querySelector('button').focus();
                    } else {
                        previousContainer.querySelector('[x-spread=item]').focus();
                    }
                } else {
                    // Else return focus to end of current submenu (focus trapping)
                    var count = currentItem.closest('ul').children.length;
                    if (currentItem.closest('ul').children[count - 1].querySelector('button') !== null) {
                        currentItem.closest('ul').children[count - 1].querySelector('button').focus();
                    } else {
                        currentItem.closest('ul').children[count - 1].querySelector('a').focus();
                    }
                }
            },

            ['x-on:keydown.arrow-down.prevent']($event) {
                var currentItem = $event.currentTarget;
                var next = $event.target.nextElementSibling; // Check to see if it's a button. Not used for next link.
                var nextContainer = $event.target.parentElement;

                if ((next !== null) && (next.matches('button'))) {
                    // If next item is a button
                    next.focus();
                } else if (currentItem.getAttribute('aria-expanded') === 'true') {
                    // If menu is open drop to first item
                    next.querySelector('[x-spread=item]').focus();
                } else if (nextContainer.nextElementSibling !== null) {
                    // If next item in list is a link or placeholder
                    nextContainer.nextElementSibling.querySelector('[x-spread=item]').focus();
                } else {
                    // Else return focus to start of current submenu (focus trapping)
                    currentItem.closest('ul').querySelector('[x-spread=item]').focus();
                }
            },

            ['x-on:keydown.arrow-up.prevent']($event) {
                var currentItem = $event.currentTarget;
                var previous = $event.target.previousElementSibling; // Check to see if it's a button. Not used for next link.
                var currentContainer = $event.target.parentElement;
                var previousContainer = currentContainer.previousElementSibling;

                if (previous !== null) {
                    // If there is a previous item in this list item
                    previous.focus();
                } else if (previousContainer !== null) {
                    // If there is a list item before then focus on the last item. Focus on button first, then link
                    if (previousContainer.querySelector('button') !== null) {
                        previousContainer.querySelector('button').focus();
                    } else {
                        previousContainer.querySelector('[x-spread=item]').focus();
                    }
                } else {
                    // Else return focus to end of current submenu (focus trapping)
                    var count = currentItem.closest('ul').children.length;
                    if (currentItem.closest('ul').children[count - 1].querySelector('button') !== null) {
                        currentItem.closest('ul').children[count - 1].querySelector('button').focus();
                    } else {
                        currentItem.closest('ul').children[count - 1].querySelector('[x-spread=item]').focus();
                    }
                }
            },

            ['x-on:keydown.tab']($event) {
                var currentItem = $event.currentTarget;
                var next = $event.target.nextElementSibling; // Check to see if it's a button. Not used for next link.
                var nextContainer = $event.currentTarget.parentElement;

                if ((next !== null) && (next.matches('button')) || (currentItem.getAttribute('aria-expanded') === 'true') || (nextContainer.nextElementSibling !== null)) {
                    return;
                } else {
                    if (!nextContainer.classList.contains('menu--top-level')) {
                        currentItem.closest('ul').previousElementSibling.focus();
                    }
                }
            },

            ['x-on:keydown.tab.shift']($event) {
                var currentItem = $event.currentTarget;
                var next = $event.target.nextElementSibling; // Check to see if it's a button. Not used for next link.
                var nextContainer = $event.currentTarget.parentElement;

                // Must reset the initial tab functionality since it bleeds into shift+tab.
                if ((next !== null) && (next.matches('button')) || (currentItem.getAttribute('aria-expanded') === 'true') || (nextContainer.nextElementSibling !== null)) {} else {
                    if (!nextContainer.classList.contains('menu--top-level')) {
                        currentItem.focus();
                    }
                }
            },

            ['x-on:keyup.tab.shift']($event) {
                var currentItem = $event.currentTarget;
                var previous = $event.target.previousElementSibling; // Check to see if it's a button. Not used for next link.
                var next = $event.target.nextElementSibling; // Check to see if it's a button. Not used for next link.
                var nextItem = $event.currentTarget.nextElementSibling;

                // This was challenging, but it works. It will show focus on the button before it moves to the end.
                // Will keep working on a smoother option.
                if ((next !== null) && !nextItem.contains(currentItem)) {
                    var count = currentItem.closest('ul').children.length;
                    if ((currentItem) && (nextItem.children && (previous !== null))) {
                        if (nextItem.children[count - 1].querySelector('button')) {
                            nextItem.children[count - 1].querySelector('button[x-spread=item]').focus();
                        } else {
                            nextItem.children[count - 1].querySelector('[x-spread=item]').focus();
                        }
                    }
                }
            },

            ['x-on:keydown.escape.prevent']($event) {
                var currentItem = $event.currentTarget;
                var enclosingUl = $event.target.closest("ul");
                var enclosingLi = enclosingUl.closest("li");
                var previousButton = enclosingUl.previousElementSibling;

                if ((currentItem.matches('button') && (currentItem.getAttribute('aria-expanded') == "true"))) {
                    currentItem.setAttribute('aria-expanded', "false");
                    this.submenuOpen = false;
                    currentItem.closest('li').classList.remove("submenu-open");
                } else if (enclosingLi !== null) {
                    this.submenuOpen = false;
                    enclosingLi.classList.remove("submenu-open");
                    enclosingLi.setAttribute('aria-expanded', "false");
                    previousButton.setAttribute('aria-expanded', "false");
                    previousButton.focus();
                } else if (previousButton) {
                    previousButton.setAttribute('aria-expanded', "false");
                }
            }
        }
    }
}