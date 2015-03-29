Sroids.Menu = function( game )
{
    Sroids.gameState = 'menu';

    Sroids.condNum = 1;
}

var text;
var sprites;

Sroids.Menu.prototype =
{

    create: function()
    {
        var bg = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'space');
        this.world.sendToBack(bg);

        // Set stage background color
        this.game.stage.backgroundColor = 0x111111;

        Sroids.splash = this.game.add.sprite( 0, 0, 'logo' );
        Sroids.splash.x = ( this.game.width - Sroids.splash.width ) / 2;
        Sroids.splash.y = ( this.game.height - Sroids.splash.height ) / 2;

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        var num_style = { font: "32px Orbitron", fill: "#004477", wordWrap: true, wordWrapWidth: 128, align: "center" };
        var style = { font: "48px Orbitron", fill: "#007799", wordWrap: true, wordWrapWidth: this.game.width-100, align: "center" };

        text = game.add.text(this.game.width/2, this.game.height*.75, "Press a number to select your Momoroids", style);
        text.anchor.set(0.5);
        text.setShadow(3,3,'rgba(20,20,20,1)',7);

        sprites = game.add.physicsGroup(Phaser.Physics.ARCADE);

        for (var i = 1; i < 5; i++) {
		    //var s = sprites.create(this.game.rnd.integerInRange(100, 700),this. game.rnd.integerInRange(100,500), 'spinner');
            var s = sprites.create(this.game.rnd.integerInRange(100, 700),
                                this. game.rnd.integerInRange(100,500),
                                'C'+i);
            s.animations.add( 'spin', [0,0,2,4,6,8,10,12,10,8,6,4,2,0,0,1,1,3,5,7,9,11,13,11,9,7,5,3,1,1] );
            s.play('spin', this.game.rnd.integerInRange(2,4), true);
            s.body.velocity.set(game.rnd.integerInRange(-200, 200), game.rnd.integerInRange(-200, 200));
            s.text = this.game.add.text(0, 0, i, num_style);
            s.text.setShadow(3,3,'rgba(20,20,20,1)',7);
            s.text.anchor.set(0.5);
            s.condNum = i;
	    }

        sprites.setAll('body.collideWorldBounds', true);
        sprites.setAll('body.bounce.x', 1);
        sprites.setAll('body.bounce.y', 1);

    },

    update: function()
    {
        sprites.forEach(function(item) {
            item.text.x = Math.floor(item.body.x + item.width / 2);
            item.text.y = Math.floor(item.body.y + item.height / 2);
        }, this);

        this.game.physics.arcade.collide(sprites);

        var start = false;
        if( this.game.input.keyboard.isDown( Phaser.Keyboard.ONE ) ){
            Sroids.condNum = 1;
            start = true;
        }
        if( this.game.input.keyboard.isDown( Phaser.Keyboard.TWO ) ){
            Sroids.condNum = 2;
            start = true;
        }
        if( this.game.input.keyboard.isDown( Phaser.Keyboard.THREE ) ){
            Sroids.condNum = 3;
            start = true;
        }
        if( this.game.input.keyboard.isDown( Phaser.Keyboard.FOUR ) ){
            Sroids.condNum = 4;
            start = true;
        }

        if( start ){
            //text.destroy();
            text.visible = false;
            sprites.forEach(function(item) {
                if(item.condNum!=Sroids.condNum){
                    item.text.destroy();
                    item.kill();
                }
            }, this);
            this.state.start( 'Game' );
        }

    },

    render: function() {
        // game.debug.body(text1);
    }
}

