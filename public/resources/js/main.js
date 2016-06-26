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