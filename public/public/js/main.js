/*!
* Baseline.js 1.1
*
* Copyright 2013, Daniel Eden http://daneden.me
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*
* Date: 2014-06-20
*/

(function (window, $) {

  'use strict';

  var baseline = (function () {

    /**
     * `_base` will later hold the value for the current baseline that matches
     * the given breakpoint. `_breakpoints` will hold a reference to all
     * breakpoints given to the baseline call.
     */

    var _base = 0,
        _breakpoints = {},
        _dynamicBase;

    /**
     * @name     _setBase
     *
     * Set the correct margin-bottom on the given element to get back to the
     * baseline.
     *
     * @param    {Element}  element
     *
     * @private
     */

    function _setBase (element) {
      var height = element.offsetHeight,
          current, old;

      if( _dynamicBase ) {

          /**
           * Compute the _base through a user defined function on each execution.
           * This could be used to get the current grid size for different breakpoints
           * from an actual element property instead of defining those breakpoints in the options.
           */
          _base = _dynamicBase();

      }
      else {

        /**
         * In this step we loop through all the breakpoints, if any were given.
         * If the baseline call received a number from the beginning, this loop
         * is simply ignored.
         */

        for (var key in _breakpoints) {
          current = key;

          if (document.body.clientWidth > current && current >= old) {
            _base = _breakpoints[key];
            old = current;
          }
        }

      }

      /**
       * We set the element's margin-bottom style to a number that pushes the
       * adjacent element down far enough to get back onto the baseline.
       */

      element.style.marginBottom = _base - (height % _base) + 'px';
    }

    /**
     * @name     _init
     *
     * Call `_setBase()` on the given element and add an event listener to the
     * window to reset the baseline on resize.
     *
     * @param    {Element}  element
     *
     * @private
     */

    function _init (element) {
      _setBase(element);

      if ('addEventListener' in window) {
        window.addEventListener('resize', function () { _setBase(element); }, false);
      } else if ('attachEvent' in window) {
        window.attachEvent('resize', function () { _setBase(element); });
      }
    }

    /**
     * @name     baseline
     *
     * Gets the correct elements and attaches the baseline behaviour to them.
     *
     * @param    {String/Element/NodeList}  elements
     * @param    {Number/Object}            options
     */

    return function baseline (elements, options) {

      /**
       * Accept a NodeList or a selector string and set `targets` to the
       * relevant elements.
       */

      var targets = typeof elements === 'string' ? document.querySelectorAll(elements) : elements,
          len = targets.length;

      /**
       * Decide whether to set the `_breakpoints` or `_dynamicBase` variables or not.
       * This will be relevant in the `_setBase()` function.
       */

      if (typeof options === 'number') {
        _base = parseInt(options, 10);
      } else if (typeof options === 'function') {
          _dynamicBase = options;
      } else if (typeof options === 'object') {
        var em = parseInt(getComputedStyle(document.body, null).getPropertyValue('font-size'), 10);

        for (var point in _breakpoints) {
          var unitless = /\d+em/.test(point) ? parseInt(point, 10) * em : /\d+px/.test(point) ? parseInt(point, 10) : point;
          _breakpoints[unitless] = parseInt(_breakpoints[point], 10);
        }
      }

      /**
       * If we have multiple elements, loop through them, otherwise just
       * initialise the functionality on the single element.
       */

      if (len > 1) {
        while (len--) { _init(targets[len]); }
      } else {
        _init(targets[0]);
      }
    };

  }());

  /**
   * Export baseline as a jQuery or Zepto plugin if any of them are loaded,
   * otherwise export as a browser global.
   */

  if (typeof $ !== "undefined") {
    $.extend($.fn, {
      baseline: function (options) {
        return baseline(this, options);
      }
    });
  } else {
    window.baseline = baseline;
  }

}(window, window.jQuery || window.Zepto || undefined));
/*!
 * hoverIntent v1.8.0 // 2014.06.29 // jQuery v1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2014 Brian Cherne
 */
 
/* hoverIntent is similar to jQuery's built-in "hover" method except that
 * instead of firing the handlerIn function immediately, hoverIntent checks
 * to see if the user's mouse has slowed down (beneath the sensitivity
 * threshold) before firing the event. The handlerOut function is only
 * called after a matching handlerIn.
 *
 * // basic usage ... just like .hover()
 * .hoverIntent( handlerIn, handlerOut )
 * .hoverIntent( handlerInOut )
 *
 * // basic usage ... with event delegation!
 * .hoverIntent( handlerIn, handlerOut, selector )
 * .hoverIntent( handlerInOut, selector )
 *
 * // using a basic configuration object
 * .hoverIntent( config )
 *
 * @param  handlerIn   function OR configuration object
 * @param  handlerOut  function OR selector for delegation OR undefined
 * @param  selector    selector OR undefined
 * @author Brian Cherne <brian(at)cherne(dot)net>
 */
(function($) {
    $.fn.hoverIntent = function(handlerIn,handlerOut,selector) {

        // default configuration values
        var cfg = {
            interval: 100,
            sensitivity: 6,
            timeout: 0
        };

        if ( typeof handlerIn === "object" ) {
            cfg = $.extend(cfg, handlerIn );
        } else if ($.isFunction(handlerOut)) {
            cfg = $.extend(cfg, { over: handlerIn, out: handlerOut, selector: selector } );
        } else {
            cfg = $.extend(cfg, { over: handlerIn, out: handlerIn, selector: handlerOut } );
        }

        // instantiate variables
        // cX, cY = current X and Y position of mouse, updated by mousemove event
        // pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
        var cX, cY, pX, pY;

        // A private function for getting mouse position
        var track = function(ev) {
            cX = ev.pageX;
            cY = ev.pageY;
        };

        // A private function for comparing current and previous mouse position
        var compare = function(ev,ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            // compare mouse positions to see if they've crossed the threshold
            if ( Math.sqrt( (pX-cX)*(pX-cX) + (pY-cY)*(pY-cY) ) < cfg.sensitivity ) {
                $(ob).off("mousemove.hoverIntent",track);
                // set hoverIntent state to true (so mouseOut can be called)
                ob.hoverIntent_s = true;
                return cfg.over.apply(ob,[ev]);
            } else {
                // set previous coordinates for next time
                pX = cX; pY = cY;
                // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
                ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
            }
        };

        // A private function for delaying the mouseOut function
        var delay = function(ev,ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            ob.hoverIntent_s = false;
            return cfg.out.apply(ob,[ev]);
        };

        // A private function for handling mouse 'hovering'
        var handleHover = function(e) {
            // copy objects to be passed into t (required for event object to be passed in IE)
            var ev = $.extend({},e);
            var ob = this;

            // cancel hoverIntent timer if it exists
            if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

            // if e.type === "mouseenter"
            if (e.type === "mouseenter") {
                // set "previous" X and Y position based on initial entry point
                pX = ev.pageX; pY = ev.pageY;
                // update "current" X and Y position based on mousemove
                $(ob).on("mousemove.hoverIntent",track);
                // start polling interval (self-calling timeout) to compare mouse coordinates over time
                if (!ob.hoverIntent_s) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}

                // else e.type == "mouseleave"
            } else {
                // unbind expensive mousemove event
                $(ob).off("mousemove.hoverIntent",track);
                // if hoverIntent state is true, then call the mouseOut function after the specified delay
                if (ob.hoverIntent_s) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
            }
        };

        // listen for mouseenter and mouseleave
        return this.on({'mouseenter.hoverIntent':handleHover,'mouseleave.hoverIntent':handleHover}, cfg.selector);
    };
})(jQuery);
!function(){var t=function(t,e){return function(){return t.apply(e,arguments)}},e={}.hasOwnProperty,n=function(t,n){function r(){this.constructor=t}for(var i in n)e.call(n,i)&&(t[i]=n[i]);return r.prototype=n.prototype,t.prototype=new r,t.__super__=n.prototype,t};this.Page=function(){function e(n,r,i){return this.url=n,this.title=r,this.content=null!=i?i:void 0,this.transitionNextState=t(this.transitionNextState,this),e.cache[this.url]?e.cache[this.url]:(e.cache[this.url]=this,void 0)}return e.PAGE_MARKER_TOKEN="<!--__ml_page_body-->",e.cache={},e.prototype.type="page",e.prototype.isBound=function(){return this.bound},e.prototype.bindEvents=function(){var t,e,n,r,i,o;if(!this.isBound()){if(this.events&&this.$el){i=this.events;for(n in i)e=i[n],o=n.match(/^(\w+) (.*)$/).slice(1),t=o[0],r=o[1],this.$el.on(""+t+".page",r,this[e])}return this.bound=!0}},e.prototype.unbindEvents=function(){return this.events&&this.$el&&this.$el.off(".page"),this.bound=!1},e.prototype.isFetched=function(){return!!this.content},e.prototype.fetch=function(){var t;return this.isFetched()?(t=$.Deferred(),t.resolve(this.content),t.promise()):$.get(this.url).then(function(t){return function(n){var r,i;return i=n.indexOf(e.PAGE_MARKER_TOKEN),r=n.indexOf(e.PAGE_MARKER_TOKEN,i+e.PAGE_MARKER_TOKEN.length),t.content=n.slice(i+e.PAGE_MARKER_TOKEN.length,r),t.renderToDOM()}}(this))},e.prototype.isRenderedToDOM=function(){return this.renderedToDOM},e.prototype.renderToDOM=function(){return this.isRenderedToDOM()?void 0:(null==this.$body&&(this.$body=$(document.body)),null==this.$main&&(this.$main=this.$body.find("#main")),this.$el=$(this.content).attr("data-state","inactive").hide(),this.$el.find(".hidden").hide().removeClass("hidden"),"undefined"!=typeof FB&&null!==FB&&FB.XFBML.parse(this.$el[0]),this.$main.find(".sidebar").after(this.$el),"undefined"!=typeof twttr&&null!==twttr&&twttr.widgets.load(),this.bindEvents(),this.renderedToDOM=!0)},e.prototype.isRendered=function(){return this.rendered},e.prototype.render=function(t){return null==t&&(t={}),e.current===this?this:(this.fetch().then(function(n){return function(){return history.pushState({title:n.title,url:n.url},n.title,n.url),"undefined"!=typeof _gaq&&null!==_gaq&&_gaq.push(["_trackPageview",n.url]),t.comments&&(n.pending=function(){return this.toggleComments(),this.$body.scrollTop(this.$el.find(".fb-comments")[0].offsetTop)}),document.body.scrollTop=0,n.renderToDOM(),n.$el.show(),setTimeout(function(){var t;return null==n.$body&&(n.$body=$(document.body)),null==n.$main&&(n.$main=n.$body.find("#main")),t=n.$main.find("[data-state=active]"),n.$body.find(".social-links").hide(),n.$el.attr("data-state","inbound"),t.attr("data-state","outbound"),n.$body.attr("data-type",n.type),setTimeout(function(){return n.transitionNextState(t),n.transitionNextState()},500),n.bindEvents(),n.rendered=!0,e.current=n},0)}}(this)),this)},e.prototype.transitionNextState=function(t){switch(t||(t=this.$el),t.attr("data-state")){case"active":if(this.pending)return this.pending.call(this),delete this.pending;break;case"inactive":return!0;case"outbound":return t.attr("data-state","inactive"),setTimeout(function(e){return function(){return e.transitionNextState(t)}}(this),500);case"inbound":return t.attr("data-state","active"),setTimeout(function(e){return function(){return e.transitionNextState(t)}}(this),500)}},e}(),this.About=function(t){function e(){return e.__super__.constructor.apply(this,arguments)}return n(e,t),e.prototype.type="about",e}(Page),this.Article=function(e){function r(){return this.toggleComments=t(this.toggleComments,this),r.__super__.constructor.apply(this,arguments)}return n(r,e),r.prototype.type="article",r.prototype.events={"click .comments.button":"toggleComments"},r.prototype.toggleComments=function(t){return null==t&&(t={}),"function"==typeof t.preventDefault&&t.preventDefault(),"function"==typeof t.stopPropagation&&t.stopPropagation(),this.$el.find(".button.comments").toggleClass("active"),this.$el.find(".fb-comments").toggle()},r}(Page),this.Index=function(e){function r(){return this.search=t(this.search,this),this.debounceSearch=t(this.debounceSearch,this),this.changeViewMode=t(this.changeViewMode,this),this._render=t(this._render,this),this.renderAbout=t(this.renderAbout,this),this.renderIndex=t(this.renderIndex,this),this.renderPage=t(this.renderPage,this),r.__super__.constructor.apply(this,arguments)}return n(r,e),r.prototype.type="home",r.prototype.events={"click .articles a":"renderPage","click .view-types a":"changeViewMode","focus .searchbar input":"fetchSearch","keyup .searchbar input":"debounceSearch","change .searchbar input":"debounceSearch"},r.prototype.bindEvents=function(){return this.isBound()?void 0:(this.$el.hoverIntent(this.preFetchPage,$.noop,".articles a"),$("h1.title a").on("click.page",this.renderIndex),$("nav li.index a").on("click.page",this.renderIndex),$("nav li.about a").on("click.page",this.renderAbout),r.__super__.bindEvents.apply(this,arguments))},r.prototype.preFetchPage=function(){var t;return t=new Article(this.pathname,this.title),t.fetch()},r.prototype.renderPage=function(t){var e;return e={},"comments"===t.target.className&&(e.comments=!0),this._render(Article,t,e)},r.prototype.renderIndex=function(t){return this._render(r,t)},r.prototype.renderAbout=function(t){return this._render(About,t)},r.prototype._render=function(t,e,n){var r;return null==n&&(n={}),e.stopPropagation(),e.preventDefault(),r=new t(e.currentTarget.pathname,e.currentTarget.title),r.render(n)},r.prototype.changeViewMode=function(t){return this.$el.removeClass("grid list").addClass(t.currentTarget.className)},r.prototype.fetchSearch=function(){var t,e;return this.searchPromise?this.searchPromise:(e={url:"/js/vendor/PorterStemmer1980.js",dataType:"script"},t={url:"/search.json",dataType:"json"},this.searchPromise=$.when($.ajax(e),$.ajax(t)).then(function(t,e){return e[0]}))},r.prototype.debounceSearch=function(t){return clearTimeout(this.debounceSearchTimeout),this.debounceSearchTimeout=setTimeout(function(e){return function(){return e.search(t.target.value)}}(this),500)},r.prototype.search=function(t){return this.fetchSearch().then(function(e){return function(n){var r,i,o,a,s,u,c,h,d,l;if(o={},s={min:0,max:0,total:0,nonzero:0,average:0,disqualify:0},e.$articles=e.$el.find(".articles"),t=t.toLowerCase(),t=t.replace(/[^\w\s]/g,""),t=t.split(/\s+/),t=t.map(function(t){return stemmer(t)}).filter(function(t){return""!==t}),t.length){for(c=0,d=n.length;d>c;c++){for(i=n[c],a=0,h=0,l=t.length;l>h;h++)u=t[h],~i.corpus.indexOf(u)&&(a+=1);s.max=Math.max(s.max,a),s.min=Math.min(s.min,a),s.total+=a,a&&(s.nonzero+=1),o[i.slug]={score:a,article:i}}return s.nonzero&&(s.average=s.total/s.nonzero),s.max>s.average?s.disqualify=s.average:s.average>s.min&&(s.disqualify=s.min),r=e.$articles.find("a"),e.originalOrder||(e.originalOrder=r.map(function(t,e){return e.getAttribute("data-slug")}).get()),e.$articles.append(r.detach().sort(function(t,e){var n,r,i,a;return r=t.getAttribute("data-slug"),n=o[r].score,a=e.getAttribute("data-slug"),i=o[a].score,i-n}).each(function(t,e){var n;return n=$(e),o[n.data("slug")].score>s.disqualify?n.show():n.hide()}))}return e.$articles.append(e.$articles.find("a").detach().sort(function(t,n){return e.originalOrder.indexOf(t.getAttribute("data-slug"))-e.originalOrder.indexOf(n.getAttribute("data-slug"))}).show())}}(this))},r}(Page)}.call(this),function(){var t;t=$(document.body),t.find(".hidden").hide().removeClass("hidden"),t.on("click",".sidebar nav a",function(e){var n,r;return n=$(this),(r=n.data("toggle"))?(t.find(r).toggle(),e.stopPropagation(),e.preventDefault()):void 0}),document.documentElement.clientWidth>=970&&(window.onpopstate=function(t){var e,n;return(n=t.state)?(e=n.index?new Index(n.url,n.title):new Article(n.url,n.title),e.render(),"undefined"!=typeof _gaq&&null!==_gaq?_gaq.push(["_trackPageview",n.url]):void 0):void 0},$(window).on("load",function(){return $("img").baseline(36)}))}.call(this);
!function() {
    var e, t, n;
	document.documentElement.clientWidth >= 970 && 
	(	e = $("#main .primary-pane").attr("data-state", "active"), 
		t = $("#main .sidebar"), 
		Page.current = n = new Index("/", "boz.", e), 
		n.content = e[0].innerHTML, 
		n.$el = e, 
		n.rendered = n.renderedToDOM = !0, 
		n.bindEvents(), 
		history.replaceState({
	        url: n.url,
	        title: n.title,
	        index: !0
		}, n.title, n.url), $
		(document.body).addClass("animated")
	)
}.call(this);