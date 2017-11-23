const gd = new GitDown('#wrapper', {
    title: 'CHEATS',
    content: 'README.md',
    callback: main
});

var toggle_html='<span class="toggle"></span>';

function main() {
    var variations = gd.update_parameter('variations');
    render_variations(variations);
    var c = $('.info .field.choices.columns .choice.selected').attr('data-value');
    columnize( c );
    alternate();
    draggable();
    update_toc();
    register_events();
}

function columnize(columns) {
    // begin by wrapping all sections in first column
    $('.section').wrapAll('<div class="column column1of' + columns + '" id="column1"/>');
    if( columns < 2 || columns > 4 ) {
        return;
    }
    for (var i=2; i <= columns; i++) {
        $('.inner').append('<div class="column column1of' + columns + '" id="column' + i + '"/>');
    }
    
    var column_counter = 1;
    
    // arrange sections into columns
    $('.section').each(function() {
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

function alternate() {
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
}

function draggable() {
    // make sections draggable
    dragula( $('.column').toArray(),  {
        moves: function (el, container, handle) {
            return handle.className === 'handle';
        }
    }).on('drop', function (el, target, source, sibling) {
        // update toc after drop
        var name_from = $(el).attr('id'); 
        var name_to = $(sibling).attr('id');
        swap (  '.toc a[href*="#' + name_from + '"]',
                '.toc a[href*="#' + name_to + '"]' );
    });
}

// from here: https://stackoverflow.com/questions/698301/is-there-a-native-jquery-function-to-switch-elements#answer-19033868
function swap(a, b) {
    a = $(a); b = $(b);
    var tmp = $('<span>').hide();
    a.before(tmp);
    b.before(a);
    tmp.replaceWith(b);
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

function update_toc() {
    
    // add toggle buttons to sections
    if ( $('.section .toggle').length < 1 ) {
        $('.section a.handle').each(function() {
            var t = $(this).html();
            $(this).html( t + toggle_html );
        });
    }
    
    // add toggle buttons to toc
    $( '.info .toc a' ).each(function() {
        var t = $(this).html();
        $(this).html( t + toggle_html );
        var name = $(this).attr('name');
        // hide toc links for hidden sections
        if ( $('#' + name).is(':hidden') ){
            $(this).addClass('hidden');
        } else $(this).removeClass('hidden');
    });
}

function register_events() {
    
    // hide sections and toc reference when toggled
    $( '.section .toggle' ).click(function() {
        var name = $(this).parent().attr('name');
        $( '#' + name ).hide();
        // add hidden class to toc item;
        $( '.toc a[href*="#' + name + '"]' ).addClass('hidden');
    });

    // column field click
    $('.info .field.choices.columns .choice').click(function(){
        var c = $(this).attr('data-value');
        // move .sections to .inner
        $('.section').appendTo('.inner');
        $('.column').remove();
        columnize( c );
        draggable();
    });
    
    // add click event to toggle items in toc
    $( '.toc .toggle' ).click(function() {
        var name = $(this).parent().attr('href');
        // toggle hidden status
        if( $(this).parent().hasClass('hidden') ) {
            $(name).show();
            $(this).parent().removeClass('hidden');
        } else {
            $(name).hide();
            $(this).parent().addClass('hidden');
        }
    });
}
