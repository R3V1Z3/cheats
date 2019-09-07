var toggle_html='<span class="toggle"></span>';

class Cheats extends BreakDown {

    constructor(el, options) {
        super(el, options);
    }

    ready() {
        // this.registerAppEvents();
    }

    updateSliderValue( name, value ) {
        var slider = this.wrapper.querySelector( `.nav .slider.${name} input` );
        slider.value = value;
        this.updateField(slider, value);
    }

    registerAppEvents() {

        if ( this.status.has('app-events-registered') ) return;
        else this.status.add('app-events-registered');

        window.addEventListener( 'resize', e => this.centerView() );

        this.events.add('.nav .collapsible.perspective .field.slider input', 'input', this.centerView);
        this.events.add('.nav .collapsible.dimensions .field.slider input', 'input', this.centerView);
        this.events.add('.nav .field.slider.fontsize input', 'input', this.centerView);
        this.events.add('.nav .field.slider.vignette input', 'input', this.vignette.bind(this));

        // this.events.add('.nav .field.select.svg-filter select', 'change', this.svgChange.bind(this));

        // LEFT and RIGHT arrows
        document.addEventListener('keyup', e => {
            const key = e.key;
            let c = '';
            if ( key === 'ArrowLeft' ) {
                c = this.sections.getPrev();
            }
            else if ( key === 'ArrowRight' ) {
                c = this.sections.getNext();
            }
            this.sections.setCurrent(c);
            this.goToSection();
        }, this);

        // mousewheel zoom handler
        this.events.add('.inner', 'wheel', e => {
            // disallow zoom within parchment content so user can safely scroll text
            let translatez = document.querySelector('.nav .slider.translatez input');
            if ( translatez === null ) return;
            var v = Number( translatez.value );
            if( e.deltaY < 0 ) {
                v += 10;
                if ( v > 500 ) v = 500;
            } else{
                v -= 10;
                if ( v < -500 ) v = -500;
            }
            this.settings.setValue('translatez', v);
            this.updateSliderValue( 'translatez', v );
        }, this );

        interact(this.eidInner)
        .gesturable({
            onmove: function (event) {
                var scale = this.settings.getValue('translatez');
                scale = scale * (5 + event.ds);
                this.updateSliderValue( 'translatez', scale );
                this.dragMoveListener(event);
            }
        })
        .draggable({ onmove: this.dragMoveListener.bind(this) });

    }

    dragMoveListener (event) {
        let target = event.target;
        if ( !target.classList.contains('inner') ) return;
        if ( event.buttons > 1 && event.buttons < 4 ) return;
        let x = (parseFloat(target.getAttribute('data-x')) || 0);
        let oldX = x;
        x += event.dx;
        let y = (parseFloat(target.getAttribute('data-y')) || 0);
        let oldY = y;
        y += event.dy;

        // when middle mouse clicked and no movement, reset offset positions
        if ( event.buttons === 4 ) {
            x = this.settings.getDefault('offsetx');
            y = this.settings.getDefault('offsety');
        }

        this.updateSliderValue( 'offsetx', x );
        this.updateSliderValue( 'offsety', y );

        // update the position attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

        this.centerView();
    }

// BEGIN ORIGINAL code =======================================================

main() {
    bd.status.log();
    var variations = bd.update_parameter('variations');
    render_variations(variations);
    alternate();
    draggable();
    update_toc();
    // register_events();
}

alternate() {
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

draggable() {
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
swap(a, b) {
    a = $(a); b = $(b);
    var tmp = $('<span>').hide();
    a.before(tmp);
    b.before(a);
    tmp.replaceWith(b);
}

render_variations(selector) {
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

update_toc() {

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

register_events() {

    // hide sections and toc reference when toggled
    $( '.section .toggle' ).click(function() {
        var name = $(this).parent().attr('name');
        $( '#' + name ).hide();
        // add hidden class to toc item;
        $( '.toc a[href*="#' + name + '"]' ).addClass('hidden');
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

}
