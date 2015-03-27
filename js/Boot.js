var Sroids = {};
Sroids.Boot = function( game ) {};
Sroids.Boot.prototype ={
    preload: function(){
        this.load.image( 'preloaderBar', 'gfx/loading_bar.png' );
    },

    create: function(){
        this.state.start( 'Preloader' );
    }
};
