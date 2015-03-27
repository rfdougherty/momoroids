Sroids.Preloader = function( game )
{
    Sroids.GAME_WIDTH = 800;
    Sroids.GAME_HEIGHT = 600;
    Sroids.bmd_med = null;
    Sroids.bmd_sml = null;
};

Sroids.Preloader.prototype =
{
    preload: function()
    {
        this.preloadBar = this.add.sprite( ( Sroids.GAME_WIDTH - 720 ) / 2, ( Sroids.GAME_HEIGHT-32 ) / 2, 'preloaderBar' );
        this.load.setPreloadSprite( this.preloadBar );

        this.game.load.image( 'splash', 'images/splash_square.png' );
        this.load.image('space', 'images/deep-space.jpg');
        this.game.load.spritesheet( 'explosion', 'images/explode.png', 64, 64 );
        this.game.load.image( 'explode_large', 'images/explosion.png' );
        this.game.load.spritesheet('ship', 'images/ship.png', 32, 32);
        this.game.load.image('bullet', 'images/bullet.png');

        // load asteroid graphics
        this.game.load.spritesheet( 'ast_sheet', 'images/C3.png', 128, 128 );

    },

    create: function()
    {
        Sroids.bmd_med = this.game.make.bitmapData( 32, 32 );
        Sroids.bmd_med.copy( 'explode_large', 0, 0, 64, 64, 0, 0, 32, 32 );

        Sroids.bmd_sml = this.game.make.bitmapData( 16, 16 );
        Sroids.bmd_sml.copy( 'explode_large', 0, 0, 64, 64, 0, 0, 16, 16 );

        this.state.start( 'Game' );
    }
};
