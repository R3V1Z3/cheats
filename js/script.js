/* global $, jQuery, dragula, location, hljs */
var TOC = [];
var toggle_html='<span class="toggle">-</span>';

    // get url parameters
    // from http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }
    
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
    if (!fontsize) fontsize = 110;
    $('body').css('font-size', fontsize + '%');
    
    // let user specify selector if variations will be used
    var variations = getURLParameter('variations');
    if (!variations) variations = '';

jQuery(document).ready(function() {

    
    // get highlight.js style if provided
    var highlight = getURLParameter('highlight');
    if (!highlight) highlight = 'default';
    // add style reference to head to load it
    $('head').append('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/styles/' + highlight.replace(/[^a-zA-Z0-9-_]+/ig, '') + '.min.css">');
    
    // allow custom Gist
    var gist = getURLParameter('gist');
    var filename = getURLParameter('filename');
    if (!gist) gist = 'd325f0e1bb629613622606f1e4765eda';
    $.ajax({
        url: 'https://api.github.com/gists/' + gist,
        type: 'GET',
        dataType: 'jsonp'
    }).success(function(gistdata) {
        var objects = [];
        if (!filename) {
            for (var file in gistdata.data.files) {
                if (gistdata.data.files.hasOwnProperty(file)) {
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
        render(objects[0]);
        render_sections();
        render_info();
        render_extra();
        render_variations(variations); // used in voice assistant cheatsheets
    }).error(function(e) {
        console.log('Error on ajax return.');
    });
    
    // allow for custom CSS via Gist
    var css = getURLParameter('css');
    var cssfilename = getURLParameter('cssfilename');
    if (css) {
        $.ajax({
            url: 'https://api.github.com/gists/' + css,
            type: 'GET',
            dataType: 'jsonp'
        }).success(function(gistdata) {
            var objects = [];
            if (!cssfilename) {
                for (var file in gistdata.data.files) {
                    if (gistdata.data.files.hasOwnProperty(file)) {
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
    }

    function render(content) {
        
        var md = window.markdownit({
            html: true, // Enable HTML tags in source
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
            var name = $(this).text().toLowerCase().replace(/\s/g, "-");
            name = name.replace(',', '');
            $(this).append(toggle_html);
            // add anchor link to make draggable
            $(this).wrapInner('<a class="handle" name="' + name + '"/>');
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
        var command_count = $('li').length;
        $('#command-count').html('Total commands: ' + command_count);
        
        // hide info
        $('#hide').click(function() {
            $('#info').toggle();
        });
        
        var url = 'https://gist.github.com/' + gist;
        $('#gist-url').html('<a href="' + url + '">' + gist + '</a>');
        
        // Add keypress to toggle info on '?' or 'h'
        $(document).keypress(function(e) {
            if(e.which == 104 || e.which == 63 || e.which == 72 || e.which == 47) {
                $('#info').toggle();
            }
        });
    }
    
    function render_toc_html() {
        var html = '';
        // iterate section classes and get id name to compose TOC
        $( '#commands .section' ).each(function() {
            var name = $( this ).attr( 'id' );
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
            console.log("parent name: " + name);
            console.log("parent hasclass hidden: " + $(this).parent().hasClass('hidden')  );
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
        if (gist === 'd325f0e1bb629613622606f1e4765eda') $('#header h1').attr('id', 'title');
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

});
