/*
 * Momoroids! View-invariant learning game.
 *
 * By Momo
 *
 * Derived from SRoids, by Keith Weatherby II 7/31/2014
 *
*/

var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { render: render } );
game.state.add( 'Boot', Sroids.Boot );
game.state.add( 'Preloader', Sroids.Preloader );
game.state.add( 'Menu', Sroids.Menu );
game.state.add( 'Game', Sroids.Game );
game.state.start('Boot');

function render()
{
    Sroids.Game.render();
}
