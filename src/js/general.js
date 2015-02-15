// Javascript bestand t.b.v. interactie.
// Functies in dit bestand moeten kunnen worden meegenomen naar een productie omgeving.
// Gebruik PROTOTYPE.JS voor simulaties, stubs, etc.

$(function() {
  $('.no-js').removeClass('no-js').addClass('js');
   
  var ui = {
    init: function() {
      this.bookmarks.init();
      this.sticky.init();
      this.scrollSpy.init();
      this.animated.init();
    },
    
    bookmarks: {
      init: function() {
        $('a[href*=#]').click(function(event){
          var $link = $(this);
          $('html, body').animate({
            scrollTop: $( $link.attr('href') ).offset().top - 100
          }, 500);
          event.preventDefault();
        });
      }
    },
        
    animated: {
      init: function() {
        var $animated = $('[js-animated="true"]'); 
        
        $(window).scroll(function() {
          
          $animated.each(function() {
            
            var $target = $(this);
            
            if( ui.isVisible($target) ) {

              $target.addClass('js-animate'); 
            }
          });
        });
      } 
    },
    
    sticky: {
      init: function() {
        if($.fn.stick_in_parent) {
          $('.js-stick-in-parent').stick_in_parent({parent: '.js-parent'})
            .on("sticky_kit:stick", function(e) {
              $('.navbar__brand > img').attr('src', '/images/logo--small.svg');
            })
            .on("sticky_kit:unstick", function(e) {
              $('.navbar__brand > img').attr('src', '/images/logo.svg');
            });
        }
      }
    },
    
    scrollSpy: {
      init: function() {
        var $targets = $('[data-scroll-spy="target"]');
        
        if($targets.length == 0) return;
       
        $(window).scroll(function() {
        
          $targets.each(function( index ) {
    
            var $target = $(this);
            var $id = $target.attr('id');
            
            if(ui.isInView($target) ) {
              var $newActivelink = $('a[href="#' + $id + '"][data-scroll-spy="link"]'),
                  $curActivelink = $('a.js-active[href!="#' + $id + '"][data-scroll-spy="link"]');
                  
              $curActivelink.removeClass('js-active');
              $newActivelink.addClass('js-active');
            }
          });
        });
      }
    },
      
    view: {
      scrollTo: function($elem, $speed) {
        if( !ui.isVisible('.i-footer') ) {

          $speed = typeof $speed !== 'undefined' ? $speed : 1200;
          
          $('html, body').animate({
            scrollTop: $($elem).offset().top
          }, $speed);
        }
      }
    },
      
    isInView: function($target) {

      var $elTopOffset = $target.offset().top - ($target.outerHeight() / 3) - 100,
          $elLowOffset = $target.offset().top + $target.outerHeight() + 100;
    

      if(window.pageYOffset >= $elTopOffset && window.pageYOffset < $elLowOffset){
        return true;
      }
      
      return false;
    }, 
    
    isVisible: function($elem) {
      var docViewTop = $(window).scrollTop();
      var docViewBottom = docViewTop + $(window).height();
  
      var elemTop = $($elem).offset().top;
      var elemBottom = elemTop + $($elem).height();
  
      return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
  };

  ui.init();
});

$(function() {
  $('[js-auto-height="true"] > *').matchHeight();
});
