(function($, window, document, undefined) {
    $.widget("infortis.ultramegamenu", {
        options: {
            mobileMenuThreshold: 770,
            mode: 0,
            itemSelector: "li",
            panelSelector: ".nav-panel",
            openerSelector: ".opener",
            isVerticalLayout: false,
            mobileClasses: "nav-mobile acco",
            mobnavTriggerableClasses: "nav-mobile-triggerable",
            regularClasses: "nav-regular",
            vertnavClasses: "nav-vert",
            vertnavTriggerableClasses: "nav-vert-triggerable",
            initMobileMenuCollapsed: true,
            initVerticalMenuCollapsed: true,
            outermostContainer: undefined,
            fullWidthDdContainer: undefined,
            ddDelayIn: 50,
            ddDelayOut: 200,
            ddAnimationDurationIn: 50,
            ddAnimationDurationOut: 200,
            isTouchDevice: "ontouchstart" in window || navigator.msMaxTouchPoints > 0
        },
        isMobile: false,
        bar: undefined,
        itemsList: undefined,
        panels: undefined,
        mobnavTrigger: undefined,
        vertnavTrigger: undefined,
        outermostContainerIsWindow: false,
        fullWidthDdContainerIsWindow: false,
        _create: function() {
            this._initPlugin()
        },
        _initPlugin: function() {
            var _self = this;
            this.bar = this.element;
            this.itemsList = this.bar.children("ul");
            this.panels = this.bar.find(this.options.panelSelector);
            this.mobnavTrigger = this.bar.parent().children(".mobnav-trigger");
            this.vertnavTrigger = this.bar.parent().children(".vertnav-trigger");
            if (this.mobnavTrigger.length) this.options.mobileClasses += " " + this.options.mobnavTriggerableClasses;
            if (this.options.isVerticalLayout) {
                this.options.regularClasses += " " + this.options.vertnavClasses;
                if (this.vertnavTrigger.length) this.options.regularClasses += " " + this.options.vertnavTriggerableClasses
            }
            if (this.options.mode === 0) this._initDualMode();
            else if (this.options.mode ===
                -1) this._initMobileMode();
            if (this.options.outermostContainer === undefined) this.options.outermostContainer = this.bar;
            else if (this.options.outermostContainer === "window") {
                this.options.outermostContainer = $(window);
                this.outermostContainerIsWindow = true
            }
            if (this.options.fullWidthDdContainer === undefined) this.options.fullWidthDdContainer = this.bar;
            else if (this.options.fullWidthDdContainer === "window") {
                this.options.fullWidthDdContainer = $(window);
                this.fullWidthDdContainerIsWindow = true
            }
            if (this.mobnavTrigger.length) this.hookToMobnavTriggerClick();
            if (this.vertnavTrigger.length) this.hookToVertnavTriggerClick();
            this._hookToStickyHeader()
        },
        _initDualMode: function() {
            var _self = this;
            this.itemsList.accordion(this.options.panelSelector, this.options.openerSelector, this.options.itemSelector);
            if ($(window).width() >= this.options.mobileMenuThreshold) _self._cleanUpAfterMobileMenu();
            enquire.register("screen and (max-width: " + (this.options.mobileMenuThreshold - 1) + "px)", {
                match: function() {
                    _self._activateMobileMenu()
                },
                unmatch: function() {
                    _self._cleanUpAfterMobileMenu()
                }
            }).register("screen and (min-width: " +
                this.options.mobileMenuThreshold + "px)", {
                    deferSetup: true,
                    setup: function() {
                        _self._cleanUpAfterMobileMenu()
                    },
                    match: function() {
                        _self._activateRegularMenu()
                    },
                    unmatch: function() {
                        _self._prepareMobileMenu()
                    }
                })
        },
        _initMobileMode: function() {
            this.itemsList.accordion(this.options.panelSelector, this.options.openerSelector, this.options.itemSelector);
            this._activateMobileMenu()
        },
        _activateMobileMenu: function() {
            this.isMobile = true;
            this.bar.addClass(this.options.mobileClasses).removeClass(this.options.regularClasses);
            this.vertnavTrigger.hide();
            this.closeMenuViaVertnavTrigger();
            this.closeMenuViaMobnavTrigger();
            this.mobnavTrigger.show();
            $(document).trigger("activate-mobile-menu")
        },
        _activateRegularMenu: function() {
            this.isMobile = false;
            this.bar.addClass(this.options.regularClasses).removeClass(this.options.mobileClasses);
            this.mobnavTrigger.hide();
            this.closeMenuViaMobnavTrigger();
            this.closeMenuViaVertnavTrigger();
            this.vertnavTrigger.show();
            $(document).trigger("activate-regular-menu")
        },
        _cleanUpAfterMobileMenu: function() {
            this.panels.css("display",
                "")
        },
        _prepareMobileMenu: function() {
            this.panels.hide();
            this.itemsList.find(".item-active").each(function() {
                $(this).children(".nav-panel").show()
            })
        },
        openMenuViaMobnavTrigger: function() {
            this.mobnavTrigger.addClass("active");
            this.bar.addClass("show")
        },
        closeMenuViaMobnavTrigger: function() {
            this.mobnavTrigger.removeClass("active");
            this.bar.removeClass("show")
        },
        openMenuViaVertnavTrigger: function() {
            this.vertnavTrigger.addClass("active");
            this.bar.addClass("show")
        },
        closeMenuViaVertnavTrigger: function() {
            this.vertnavTrigger.removeClass("active");
            this.bar.removeClass("show")
        },
        hookToMobnavTriggerClick: function() {
            var _self = this;
            this.mobnavTrigger.on("click", function(e) {
                _self.print("on mobnavTrigger click");
                if ($(this).hasClass("active")) _self.closeMenuViaMobnavTrigger();
                else _self.openMenuViaMobnavTrigger()
            });
            if (this.isMobile && this.options.initMobileMenuCollapsed == false) _self.openMenuViaMobnavTrigger()
        },
        hookToVertnavTriggerClick: function() {
            var _self = this;
            this.vertnavTrigger.on("click", function(e) {
                _self.print("on vertnavTrigger click");
                if ($(this).hasClass("active")) _self.closeMenuViaVertnavTrigger();
                else _self.openMenuViaVertnavTrigger()
            });
            if (this.isMobile == false && this.options.initVerticalMenuCollapsed == false) _self.openMenuViaVertnavTrigger()
        },
        enableDropdowns: function() {
            this._hookToItemHoverDynamically()
        },
        _hookToItemHoverDynamically: function() {
            var _self = this;
            this.bar.on("mouseenter", "li.parent.level0", function() {
                if (_self.isMobile == false) _self._showDropdown($(this))
            }).on("mouseleave", "li.parent.level0", function() {
                if (_self.isMobile == false) _self._hideDd($(this))
            })
        },
        _showDropdown: function(item) {
            var _self =
                this;
            var menubar = this.bar;
            var dd = item.children(".nav-panel");
            var isVert = menubar.hasClass("nav-vert");
            var itemPos = item.position();
            var modX = 0;
            var modY = 0;
            /*******************Code Modified**************************/
            if (isVert) modX = item.outerWidth();
            else modY = item.height();
            var ddPos = {
                left: itemPos.left + modX,
                top: itemPos.top + modY+5
            };
            
            var ancH = item.children(".level-top");
            var checkExp = /scuba-gear/gi;
            if (ancH.attr("href").match(checkExp)) {
                dd.find("ul").addClass("scuba-gear");
            }
            /************************End Code********************************/
            var origWidth = dd.data("original-width");
            if (origWidth !== undefined) dd.width(origWidth);
            var outermostCon = this.options.outermostContainer;
            var outermostConWidth = outermostCon.outerWidth();
            var ddWidth = dd.outerWidth();
            var fullWidthDdCon = this.options.fullWidthDdContainer;
            var menubarOffset;
            if (this.outermostContainerIsWindow === false) menubarOffset = menubar.offset().left - outermostCon.offset().left;
            else menubarOffset = menubar.offset().left;
            var ddOffset = menubarOffset + ddPos.left;
            if (dd.hasClass("full-width"))
                if (isVert) {
                    var freeSpaceWidth = outermostConWidth - (menubarOffset + menubar.outerWidth());
                    dd.width(freeSpaceWidth)
                } else {
                    var manubarShiftToFullWidthDdCon;
                    if (this.fullWidthDdContainerIsWindow === false) manubarShiftToFullWidthDdCon = menubar.offset().left - fullWidthDdCon.offset().left;
                    else manubarShiftToFullWidthDdCon = menubar.offset().left;
                    dd.width(fullWidthDdCon.outerWidth());
                    ddPos.left = -1 * manubarShiftToFullWidthDdCon
                }
            else {
                var diffRight = ddOffset + ddWidth - outermostConWidth;
                if (diffRight > 0)
                    if (isVert) {
                        var freeSpaceWidth = outermostConWidth - (menubarOffset + menubar.outerWidth());
                        dd.data("original-width", ddWidth);
                        dd.width(freeSpaceWidth)
                    } else {
                        var ddPosLeft_NEW = ddPos.left - diffRight;
                        var diffLeft = ddOffset - diffRight;
                        if (diffLeft < 0) {
                            dd.data("original-width", ddWidth);
                            dd.width(outermostConWidth);
                            ddPos.left = -1 * menubarOffset
                        } else ddPos.left = ddPosLeft_NEW
                    }
            }
            dd.css({
                "left": ddPos.left + "px",
                "top": ddPos.top + "px"
            }).stop(true, true).delay(_self.options.ddDelayIn).fadeIn(_self.options.ddAnimationDurationIn, "easeOutCubic")
        },
        _hideDd: function(item) {
            var _self = this;
            item.children(".nav-panel").stop(true, true).delay(_self.options.ddDelayOut).fadeOut(_self.options.ddAnimationDurationOut, "easeInCubic")
        },
        _hookToStickyHeader: function() {
            var _self = this;
            $(document).on("activate-sticky-header", function(e) {
                _self.itemsList.children(".nav-item--parent").each(function() {
                    $(this).children(".nav-panel").hide();
                    _self.print("instant hide")
                })
            })
        },
        print: function(msg) {}
    })
})(jQuery, window, document);