/* global $, jQuery, URI, dragula, location, hljs, HtmlWhitelistedSanitizer */
var TOC = [];
var toggle_html='<span class="toggle">-</span>';

// get url parameters
// from http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
}

var preprocess = getURLParameter('preprocess');
if (!preprocess) preprocess = false;
var showonly = getURLParameter('showonly');
if (!showonly) showonly = '';
var columns = getURLParameter('columns');
if (!columns) columns = 3;

// let user select section heading and header tags
var header = getURLParameter('header');
if (!header) header = 'h1';
var heading = getURLParameter('heading');
if (!heading) heading = 'h2';

// allow user to override fontsize
var fontsize = getURLParameter('fontsize');
if (fontsize) {
    $('#wrapper').css('font-size', fontsize + '%');
}

// let user specify selector if variations will be used
var variations = getURLParameter('variations');
if (!variations) variations = '';

var gist_filename = 'README.md';
var css_filename = 'Default';

jQuery(document).ready(function() {

    // get highlight.js style if provided
    var highlight = getURLParameter('highlight');
    if (!highlight) highlight = 'default';
    // add style reference to head to load it
    $('head').append('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/styles/' + highlight.replace(/[^a-zA-Z0-9-_]+/ig, '') + '.min.css">');
    
    // allow custom Gist
    var gist = getURLParameter('gist');
    var filename = getURLParameter('filename');
    if ( !gist || gist === 'default' ) {
        $.ajax({
            url : "README.md",
            dataType: "text",
            success : function (data) {
                su_render(data);
            }
        });
    } else {
        $.ajax({
            url: 'https://api.github.com/gists/' + gist,
            type: 'GET',
            dataType: 'jsonp'
        }).success(function(gistdata) {
            var objects = [];
            if (!filename) {
                for (var file in gistdata.data.files) {
                    if (gistdata.data.files.hasOwnProperty(file)) {
                        // get gist filename
                        gist_filename = gistdata.data.files[file].filename;
                        // get file contents
                        var o = gistdata.data.files[file].content;
                        if (o) {
                            objects.push(o);
                        }
                    }
                }
            } else {
                objects.push(gistdata.data.files[filename].content);
            }
            su_render(objects[0]);
        }).error(function(e) {
            console.log('Error on ajax return.');
        });
    }
    
    function su_render(data) {
        // fancy super user renderer function :)
        if( preprocess === 'true' ) {
            data = preprocess(data);
        }
        render(data);
        render_sections();
        render_info();
        render_extra();
        render_variations(variations); // used in voice assistant cheatsheets
        jump_to_hash();
        register_events();
        
        // hide selectors at start
        $('#info .selector').hide();
    }
    
    function jump_to_hash() {
        // now with document rendered, jump to user provided url hash link
        var hash = new URI().hash();
        if( hash && $(hash).length > 0 ) {
            // scroll to location
            $('body').animate({
                scrollTop: $(hash).offset().top
            });
        }
    }
    
    // to help with incorrectly formatted Markdown (which is very common)
    function preprocess(data) {
        var processed = '';
        var lines = data.split('\n');
        $.each(lines, function(){
            var p = fix_faulty_markdown(this, '######');
            if ( p === this ){
                // no change, so continue header check
                p = fix_faulty_markdown(this, '#####');
            }
            if ( p === this ){
                p = fix_faulty_markdown(this, '####');
            }
            if ( p === this ){
                p = fix_faulty_markdown(this, '###');
            }
            if ( p === this ){
                p = fix_faulty_markdown(this, '##');
            }
            if ( p === this ){
                p = fix_faulty_markdown(this, '#');
            }
            if ( p === this ){
                p = fix_faulty_markdown(this, '-');
            }
            processed += p + '\n';
        });
        console.log (processed);
        return processed;
    }
    
    function fix_faulty_markdown(str, sequence) {
        var l = sequence.length;
        // get first l number of chars in str
        var t = str.substr(0, l);
        if ( t === sequence ) {
            // found match, now test if subsequent char is space
            var following = str.substr(l, 1);
            if ( following !== ' ' ){
                str = str.replace( sequence, sequence + ' ' );
            }
        }
        return str;
    }
    
    
    // allow for custom CSS via Gist
    var css = getURLParameter('css');
    var cssfilename = getURLParameter('cssfilename');
    if (css && css != 'default') {
        $.ajax({
            url: 'https://api.github.com/gists/' + css,
            type: 'GET',
            dataType: 'jsonp'
        }).success(function(gistdata) {
            var objects = [];
            if (!cssfilename) {
                for (var file in gistdata.data.files) {
                    if (gistdata.data.files.hasOwnProperty(file)) {
                        // get filename
                        css_filename = gistdata.data.files[file].filename;
                        // get file contents
                        var o = gistdata.data.files[file].content;
                        if (o) {
                            objects.push(o);
                        }
                    }
                }
            }
            else {
                objects.push(gistdata.data.files[filename].content);
            }
            render_css(objects[0]);
        }).error(function(e) {
            console.log('Error on ajax return.');
        });
    }
    
    function render_css(css) {
        // attempt to sanitize CSS so hacker don't splode our website
        var parser = new HtmlWhitelistedSanitizer(true);
        var sanitizedHtml = parser.sanitizeString(css);
        $('head').append('<style>' + sanitizedHtml + '</style>');
        // update info panel
        render_info();
    }

    function render(content) {
        
        var md = window.markdownit({
            html: false, // Enable HTML tags in source
            xhtmlOut: true, // Use '/' to close single tags (<br />).
            breaks: true, // Convert '\n' in paragraphs into <br>
            langPrefix: 'language-', // CSS language prefix for fenced blocks.
            linkify: true,
            typographer: true,
            quotes: '“”‘’',
            highlight: function(str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre class="hljs"><code>' +
                            hljs.highlight(lang, str, true).value +
                            '</code></pre>';
                    }
                    catch (__) {}
                }
                return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
            }
        });
        $('#wrapper').html( md.render(content) );
    }
    
    function css_name(str) {
        str = str.toLowerCase();
        // remove non-alphanumerics
        str = str.replace(/[^a-z0-9_\s-]/g, '-');
        // clean up multiple dashes or whitespaces
        str = str.replace(/[\s-]+/g, ' ');
        // remove leading and trailing spaces
        str = str.trim();
        // convert whitespaces and underscore to dash
        str = str.replace(/[\s_]/g, '-');
        return str;
    }
    
    function render_sections() {
        
        // header section
        if ( $('#wrapper ' + header).length ) {
            $('#wrapper ' + header).each(function() {
                $(this).nextUntil(heading).andSelf().wrapAll('<section id="header"/>');
                $(this).wrapInner('<a name="header"/>');
            });
        } else {
            //no header, so we'll add an empty one
            $('#wrapper').prepend('<section id="header"></section>');
        }
        
        // command sections
        $('#wrapper ' + heading).each(function() {
            // get content of heading
            // we need to ensure we have a css compatible name/id
            var name = css_name( $(this).text() );
            //name = name.replace(',', '');
            $(this).append(toggle_html);
            // add anchor link to make draggable
            $(this).wrapInner('<a class="handle" name="' + name + '" href="#' + name + '"/>');
            $(this).wrap('<div class="heading/>');
            $(this).nextUntil(heading).andSelf().wrapAll('<div class="section" id="' + name + '"/>');
            $(this).nextUntil(heading).wrapAll('<div class="content"/>');
        });
        
        // wrap all command sections in new section
        // can't use #header since there's a header in the info panel
        $('#header').siblings().wrapAll('<section id="commands"/>');
        
        // add alternate classes to paragraphs
        var counter = 0;
        $('.content').children().each(function() {
            if ( $( this ).is('p') ) {
                if (counter === 0) {
                    $(this).addClass('alternate');
                    // check previous element and add 'alternative' class as needed
                    var $prev = $(this).prev();
                    if ( $prev.is('h1') || $prev.is('h2') || $prev.is('h3') || $prev.is('h4') || $prev.is('h5') || $prev.is('h6')) {
                        $prev.addClass('alternate');
                    }
                    // check next element and add 'alternative' class as needed
                    var $next = $(this).next();
                    if ( $next.is('ul') || $next.is('blockquote') || $next.is('code')  || $next.is('pre') ) {
                        $next.addClass('alternate');
                    }
                }
                counter += 1;
                if (counter === 2) counter = 0;
            }
        });
        
        columnize(columns);
        
        // hide all other sections if showonly has been specified
        if(showonly != '') {
            $('#' + showonly).siblings().hide();
        }
        
        // make sections draggable
        dragula( $('.column').toArray(),  {
            moves: function (el, container, handle) {
                return handle.className === 'handle';
            }
        }).on('drop', function (el) {
            // update toc
            render_toc_html();
        });
    }
    
    function columnize(columns) {
        // begin by wrapping all sections in first column
        $('#commands .section').wrapAll('<div class="column column1of' + columns + '" id="column1"/>');
        if( columns < 2 || columns > 4 ) {
            return;
        }
        for (var i=2; i <= columns; i++) {
            $('#commands').append('<div class="column column1of' + columns + '" id="column' + i + '"/>');
        }
        
        var column_counter = 1;
        
        // iterate sections
        $('#commands .section').each(function() {
            if( column_counter > 1 ) {
                // move this section to next column
                $(this).detach().appendTo('#column' + column_counter);
            }
            column_counter += 1;
            if( column_counter > columns ) {
                column_counter = 1;
            }
        });
    }
    
    function render_info() {
        
        // render TOC
        render_toc_html();
        
        // command count
        var current = $('#command-count').text();
        current = current.split(' total')[0];
        render_count(current);
        
        var url = '';
        if (gist) {
            url = 'https://gist.github.com/' + gist;
            $('#gist-details a:first-child').attr('href', url);
            $('#gist-url').text('▼ ' + gist_filename);
        }
        
        if (css) {
            url = 'https://gist.github.com/' + css;
            $('#css-details a:first-child').attr('href', url);
            $('#css-url').text('▼ ' + css_filename);
        }
    }
    
    function render_toc_html() {
        var html = '';
        // iterate section classes and get id name to compose TOC
        $( '#commands .section' ).each(function() {
            var name = $(this).attr('id');
            var toggle_hidden = '';
            if ( $('#' + name).is(':hidden') ){
                toggle_hidden ='class="hidden"';
            }
            html += '<a href="#' + name + '" ' + toggle_hidden + '>';
            html += name;
            html += toggle_html;
            html += '</a>';
        });
        $('#toc').html( html );
        
        // add click event to items
        $( "#toc .toggle" ).click(function() {
            var name = $(this).parent().attr('href');
            // toggle hidden status
            if( $(this).parent().hasClass('hidden') ) {
                $(name).show();
                $(this).parent().removeClass('hidden');
            } else {
                $(name).hide();
            }
            render_toc_html();
        });
    }
    
    function render_extra () {
        
        // add styling to header when viewing README file
        if (!gist) $('#header h1').attr('id', 'title').addClass('cheats');
        
        // hide sections and toc reference when toggled
        $( ".section .toggle" ).click(function() {
            var name = $(this).parent().attr('name');
            $('#' + name).hide();
            render_toc_html();
        });
    }
    
    function render_variations(selector) {
        if ( selector === 'yes' || selector === 'true' ) selector = '.content li strong';
        if ( selector != '' ) {
            // handle variations, display first item
            var $html = '';
            $(selector).each(function(){
                var items = $(this).text().split('/');
                $.each( items, function( key, value ) {
                    if (key == 0){
                        $html = '<span class="variation current">' + value + '</span>';
                    } else {
                        $html += '<span class="variation">' + value + '</span>';
                    }
                });
                $(this).html($html);
            });
            
            // make variations clickable
            $(selector).click(function() {
                var current = $(this).find('.variation.current');
                $(current).removeClass('current');
                if ($(current).next('.variation').length) {
                    $(current).next('.variation').addClass('current');
                } else {
                    $(this).find('.variation').first().addClass('current');
                }
            });
        }
    }
    
    function render_count(element) {
        var count = $( '#wrapper ' + element ).length;
        $('#command-count').html('<code>' + element + '</code>' + ' total: ' + count);
    }
    
    function register_events() {
        
        // commmand count
        $('#command-count').click(function() {
            var count_array = ['.section','kbd','li','code'];
            // get current count option
            var current = $('#command-count').text();
            current = current.split(' total')[0];
            
            // find current item in count_array
            var x = count_array.indexOf(current);
            // increment current item
            if ( x === count_array.length - 1 ) {
                x = 0;
            } else {
                x += 1;
            }
            current = count_array[x];
            render_count(current);
        });
        
        // event handler to toggle info panel
        $('#hide').click(function() {
            $('#info').toggle();
        });
        
        // close input panel when wrapper is clicked
        $('#input-wrapper').on('click', function (e) {
            if ( $(e.target).closest("#input-panel").length === 0 ) {
                $(this).hide();
            }
        });
        
        // Key events
        $(document).keyup(function(e) {
            if( e.which == 191 ) {
                // ? or /
                $('#info').toggle();
            } else if (e.keyCode === 27) {
                // Escape
                $('.selector').hide();
                console.log('Escape.');
            }
        });
        
        $('#gist-input').keyup(function(e) {
            if( e.which == 13 ) {
                var uri = new URI();
                uri.setQuery({ gist : $(this).val() });
                window.location.href = uri;
            }
        });
        
        $('#css-input').keyup(function(e) {
            if( e.which == 13 ) {
                var uri = new URI();
                uri.setQuery({ css : $(this).val() });
                window.location.href = uri;
            }
        });
        
        // hide selector if it or link not clicked
        $(document).click(function(event) {
            var id = event.target.id;
            if ( $('#gist-selector').is(':visible') ) {
                if ( id === 'gist-url' || id === 'gist-selector' || id === 'gist-input' ) {
                } else {
                    $('#gist-selector').hide();
                }
            }
            if ( $('#css-selector').is(':visible') ) {
                if ( id === 'css-url' || id === 'css-selector' || id === 'css-input' ) {
                } else {
                    $('#css-selector').hide();
                }
            }
        });
        
        // Gist and CSS selectors
        $('.selector-toggle').click(function() {
            var prefix = '#gist';
            var id = $(this).attr('id');
            if ( id === 'css-url' ) {
                prefix = '#css';
            }
            $(prefix + '-selector').toggle();
            // move focus to text input
            $(prefix + '-input').focus();

            // set position
            var p = $(this).position();
            $(prefix + '-selector').css({
                top: p.top + $(this).height() + 10,
                left: p.left - 50
            });
            
            // create click events for links
            $(prefix + '-selector span').click(function(event) {
                var uri = new URI();
                if ( prefix === '#gist' ){
                    uri.setQuery({ gist : $(this).attr("id") });
                } else {
                    uri.setQuery({ css : $(this).attr("id") });
                }
                window.location.href = uri;
            });
        });
    }

});
