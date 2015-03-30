Sroids.Game = function( game )
{
    Sroids.player = null;

    Sroids.gameState = 'splash';

    Sroids.splash = null;

    Sroids.score = 0;
    Sroids.LARGE_ASTEROID_SCORE = 100;
    Sroids.MEDIUM_ASTEROID_SCORE = 200;
    Sroids.SMALL_ASTEROID_SCORE = 400;
    Sroids.NUM_SIZES = 2; // 1 for only large, 2 for large & medium, 3 for all
    Sroids.SPEED_INC = 1.0; // speed increase factor for each level
    Sroids.KILL_BAD_HITS = false; // flag- if true, bad hits still destroy the momoroid
    Sroids.level = 0;
    Sroids.highscore = 0;

    Sroids.condNum = 1;
    Sroids.username = document.getElementById('username').value;
    Sroids.version = '1.0';

    Sroids.gameOverScreenText = null;
    Sroids.currentTime = 0;
    Sroids.levelScreenText = null;

    Sroids.endLevel = false;  // just a flag

    Sroids.livesText = null;
    Sroids.scoreText = null;
    Sroids.levelText = null;
    Sroids.highscoreText = null;

    Sroids.explosions = null;  // explosion pool

    Sroids.asteroids = [];

    Sroids.MAX_ASTEROIDS = 60;

    Sroids.numAsteroids = 0;
    Sroids.numStartingAsteroids = 8;
    Sroids.server = 'http://web.stanford.edu/~moqiant/cgi-bin/momoroids_data.php'
}

Sroids.Game.prototype =
{
    create: function()
    {
        var bg = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'space');

        // Set stage background color
        game.stage.backgroundColor = 0x111111;

        // Show FPS
        //this.game.time.advancedTiming = true;
        //this.fpsText = this.game.add.text( 360, 20, '', { font: '18px Arial', fill: '#aa0000' } );
        //this.accelText = this.game.add.text( 20, 40, '', { font: '16px Arial', fill: '#ffffff' } );

        // splash / title screen
        Sroids.splash = this.game.add.sprite( 0, 0, 'logo' );
        Sroids.splash.x = ( this.game.width - Sroids.splash.width ) / 2;
        Sroids.splash.y = ( this.game.height - Sroids.splash.height ) / 2;

        var style = { font: "48px Orbitron", fill: "#007799", wordWrap: true, wordWrapWidth: this.game.width-100, align: "center" };
        Sroids.splash_text = this.game.add.text(this.game.width/2, this.game.height*.75, "Hit the fire button to start", style);
        Sroids.splash_text.anchor.set(0.5);
        Sroids.splash_text.setShadow(3,3,'rgba(20,20,20,1)',7);

        Sroids.splash.kill();

        // Essentially uses the explode graphic
        // made a pool and then simply display them at the right time
        Sroids.explosions = this.game.add.group();
        Sroids.explosions.createMultiple( 60, 'explosion' );
        Sroids.explosions.setAll( 'anchor.x', 0.5 );
        Sroids.explosions.setAll( 'anchor.y', 0.5 );
        Sroids.explosions.callAll( 'kill' );

        Sroids.player = new Player( game );

        for( var i = 0; i < Sroids.MAX_ASTEROIDS; i++ )
        {
            Sroids.asteroids[ i ] = new Asteroid( game );
            if( Sroids.asteroids[ i ] != null )
            {
                Sroids.asteroids[ i ].create( Sroids.condNum, 0, 0 );

                // each color gets an even break
                switch(  i % 14 ) //this.game.rnd.integerInRange( 1, 5 ) )
                {
                    case  0: Sroids.asteroids[ i ].setType( 'ast_0_0' ); break;
                    case  1: Sroids.asteroids[ i ].setType( 'ast_1_0' ); break;
                    case  2: Sroids.asteroids[ i ].setType( 'ast_0_1' ); break;
                    case  3: Sroids.asteroids[ i ].setType( 'ast_1_1' ); break;
                    case  4: Sroids.asteroids[ i ].setType( 'ast_0_2' ); break;
                    case  5: Sroids.asteroids[ i ].setType( 'ast_1_2' ); break;
                    case  6: Sroids.asteroids[ i ].setType( 'ast_0_3' ); break;
                    case  7: Sroids.asteroids[ i ].setType( 'ast_1_3' ); break;
                    case  8: Sroids.asteroids[ i ].setType( 'ast_0_4' ); break;
                    case  9: Sroids.asteroids[ i ].setType( 'ast_1_4' ); break;
                    case 10: Sroids.asteroids[ i ].setType( 'ast_0_5' ); break;
                    case 11: Sroids.asteroids[ i ].setType( 'ast_1_5' ); break;
                    case 12: Sroids.asteroids[ i ].setType( 'ast_0_6' ); break;
                    default: Sroids.asteroids[ i ].setType( 'ast_1_6' ); break;

                };

            }
        }
        this.world.sendToBack(bg);
        // this.game.plugins.add('Juicy');
        this.juicy = this.game.plugins.add(new Phaser.Plugin.Juicy(this));
        this.badScreenFlash = this.juicy.createScreenFlash('red');
        this.add.existing(this.badScreenFlash);
        this.goodScreenFlash = this.juicy.createScreenFlash('green');
        this.add.existing(this.goodScreenFlash);

    },

    initAsteroids: function( level )
    {
        var bias = 0;  // Zero for the left side, One for the right
        var rangeMin = 0;
        var rangeMax = this.game.width - 1;

        for( var i = 0; i < Sroids.MAX_ASTEROIDS; i++ )
        {
            // this bias stuff is just for what side to put the asteroids on, so as to not be on top of the player.
            if( bias === 0 )
            {
                rangeMin = 0;
                rangeMax = ( ( this.game.width - 176 ) / 2 ) - 1;
            }
            else
            {
                rangeMin = this.game.width - ( ( ( this.game.width - 176 ) / 2 ) - 1 );
                rangeMax = this.game.width - 1;
            }

            if( bias === 0 ) bias = 1; else bias = 0;

            var randX = this.game.rnd.integerInRange( rangeMin, rangeMax );
            var randY = this.game.rnd.integerInRange( 0, this.game.height - 1 );

            //We want to make sure there are no asteroids in the exact same place
            do
            {
                var exactMatch = false;

                // get a random position
                randX = this.game.rnd.integerInRange( rangeMin, rangeMax );
                randY = this.game.rnd.integerInRange( 0, this.game.height - 1 );

                // go through each asteroid position
                for( var j = 0; j < Sroids.MAX_ASTEROIDS; j++ )
                {
                    // if there is an exact position match, then break out of this loop
                    // in order to get a new random position, and then check again
                    if( Sroids.asteroids[ j ].getX() === randX && Sroids.asteroids[ j ].getY() === randY )
                    {
                        exactMatch = true;
                        break;
                    }
                }

            } while( exactMatch === true );  // break when exact match is false

            var asteroid = Sroids.asteroids[ i ];

            asteroid.setX( randX );
            asteroid.setY( randY );
            asteroid.size = 'large';

            asteroid.setScale( 1, 1 );

            // each color gets an even break
            switch(  i % 14 )
            {
                case  0: asteroid.setType( 'ast_0_0' ); break;
                case  1: asteroid.setType( 'ast_1_0' ); break;
                case  2: asteroid.setType( 'ast_0_1' ); break;
                case  3: asteroid.setType( 'ast_1_1' ); break;
                case  4: asteroid.setType( 'ast_0_2' ); break;
                case  5: asteroid.setType( 'ast_1_2' ); break;
                case  6: asteroid.setType( 'ast_0_3' ); break;
                case  7: asteroid.setType( 'ast_1_3' ); break;
                case  8: asteroid.setType( 'ast_0_4' ); break;
                case  9: asteroid.setType( 'ast_1_4' ); break;
                case 10: asteroid.setType( 'ast_0_5' ); break;
                case 11: asteroid.setType( 'ast_1_5' ); break;
                case 12: asteroid.setType( 'ast_0_6' ); break;
                default: asteroid.setType( 'ast_1_6' ); break;
            };

            // speed everything up each level
            asteroid.incBaseSpeed( level * Sroids.SPEED_INC, level * Sroids.SPEED_INC );

            var baseX = asteroid.getBaseXSpeed();
            var baseY = asteroid.getBaseYSpeed();

            // set asteroid in a random direction
            if( this.game.rnd.integerInRange( 0, 1 ) === 0 )
                asteroid.setXVel( baseX );
            else
                asteroid.setXVel( -baseX );

            if( this.game.rnd.integerInRange( 0, 1 ) === 0 )
                asteroid.setYVel( baseY );
            else
                asteroid.setYVel( -baseY );

            // make the bounding box smaller than the large sprite, since we're starting with all large asteroids
            asteroid.setWidth( 128 - ( 128 / 4 ) );
            asteroid.setHeight( 128 - ( 128 / 4 ) );

            // we don't want anymore than say 15 asteroids on screen,
            // and I doubt you could make it all the way to that level
            if( i < Sroids.numStartingAsteroids )
            {
                // the count is to determine when we've finished a level
                asteroid.revive();
                Sroids.numAsteroids++;
            }
        }

        if( Sroids.numStartingAsteroids < 16 )
        {
            if( level % 2 === 0 )
                Sroids.numStartingAsteroids += 2;
        }

    },

    // Here's where we spawn asteroids, so we have to revive all 3 clones and position them
    // according to the primary.
    spawnAsteroid: function( x, y, size, h_bias, v_bias, type )
    {
        for( var i = 0; i < Sroids.MAX_ASTEROIDS; i++ )
        {
            // get our first free "empty"
            var asteroid = Sroids.asteroids[ i ];

            if( asteroid != null )
            {
                if( asteroid.doesExist() === false )
                {
                    asteroid.revive();
                    Sroids.numAsteroids++;

                    asteroid.size = size;
                    asteroid.setX( x + this.game.rnd.integerInRange( -3, 3 ) );
                    asteroid.setY( y + this.game.rnd.integerInRange( -3, 3 ) );

                    asteroid.setType( type );
                    //asteroid.playAnim( size );

                    var xSpeed = asteroid.getBaseXSpeed();
                    var ySpeed = asteroid.getBaseYSpeed();

                    // we need to set the body size to match the new graphic we loaded.
                    // also here we set the speed
                    if( size === 'medium' )
                    {
                        asteroid.setWidth( 64 - (64 / 4 ) );
                        asteroid.setHeight( 64 - ( 64 / 4 ) );
                        xSpeed += 1 + this.game.rnd.integerInRange( -2, 2 );
                        ySpeed += 2 + this.game.rnd.integerInRange( -2, 2 );
                        asteroid.setScale( .5, .5 );
                    }
                    else if( size === 'small' )
                    {
                        asteroid.setWidth( 32 - (32 / 4 ) );
                        asteroid.setHeight( 32 - ( 32 / 4 ) );
                        xSpeed += 3 + this.game.rnd.integerInRange( -3, 3 );
                        ySpeed += 4 + this.game.rnd.integerInRange( -3, 3 );
                        asteroid.setScale( .25, .25 );
                    }

                    // just so they aren't all going the same way.
                    if( v_bias === 'up' )
                        asteroid.setYVel( -ySpeed );
                    else if( v_bias === 'down' )
                        asteroid.setYVel( ySpeed );

                    if( h_bias === 'left' )
                        asteroid.setXVel( -xSpeed );
                    else if( h_bias === 'right' )
                        asteroid.setXVel( xSpeed );
                    break;
                }
            }

        }  // end for
    },

    update: function()
    {
        //if (this.game.time.fps !== 0) this.fpsText.setText(this.game.time.fps + ' FPS');

        // standard state machine
        switch( Sroids.gameState )
        {
            case 'splash':
                if( !Sroids.splash.exists )
                {
                    Sroids.splash.revive();
                    Sroids.splash_text.visible = true;
                }

                if( Sroids.splash.exists )
                {
                    //this.game.input.keyboard.isDown( Phaser.Keyboard.SPACEBAR )
                    if( this.game.input.keyboard.isDown( Phaser.Keyboard.A )
                        || this.game.input.keyboard.isDown( Phaser.Keyboard.S ) ){
                        Sroids.splash.kill();
                        Sroids.splash_text.visible = false;
                        Sroids.gameState = 'new game';
                    }
                }
            break;

            case 'new game':
                Sroids.player.create();
                Sroids.score = 0;
                Sroids.level = 0;

                for( var i = 0; i < Sroids.MAX_ASTEROIDS; i++ )
                {
                    var asteroid = Sroids.asteroids[ i ];

                    asteroid.setBaseXSpeed( 1 );
                    asteroid.setBaseYSpeed( 3 );

                    // how far you can increment the base speed to
                    asteroid.setBaseXLimit( 50 );
                    asteroid.setBaseYLimit( 50 );
                }
                Sroids.numAsteroids = 0;
                this.send_data('startgame');
                this.startNewLevel();
            break;

            case 'game over screen':
                if( this.game.time.now - Sroids.currentTime > 3000 )
                {
                    Sroids.gameState = 'splash';
                    Sroids.gameOverScreenText.destroy();
                }
            break;

            case 'level screen':
                if( this.game.time.now - Sroids.currentTime > 1500 )
                {
                    Sroids.gameState = 'init level';
                    Sroids.levelScreenText.destroy();
                    Sroids.endLevel = false;

                    // should probably be set in the init level state, but did them here instead.
                    if( Sroids.player.firekey === null )
                    {
                        Sroids.player.firekey = game.input.keyboard.addKey( Phaser.Keyboard.A );
                        Sroids.player.firekey.onDown.add( function(key) { Sroids.player.fireBullet( '0' ) }, this );
                    }

                    if( Sroids.player.altFirekey === null )
                    {
                        Sroids.player.altFirekey = game.input.keyboard.addKey( Phaser.Keyboard.S );
                        Sroids.player.altFirekey.onDown.add( function(key) { Sroids.player.fireBullet( '1' ) }, this );
                    }

                }
            break;

            case 'init level':
                Sroids.gameState = 'play level';

                Sroids.player.reset();
                Sroids.player.invincible = true;

                this.initAsteroids( Sroids.level );

                // hud stuff.
                Sroids.livesText = this.game.add.text( 20, this.game.height - 40, '', { font: '16px Orbitron', fill: '#ffffff' } );
                Sroids.scoreText = this.game.add.text( 20, 20, '', { font: '16px Orbitron', fill: '#ffffff' } );
                Sroids.levelText = this.game.add.text( this.game.width - 100, this.game.height - 40, '', { font: '16px Orbitron', fill: '#ffffff' } );
                Sroids.highscoreText = this.game.add.text( this.game.width - 130, 20, '', { font: '16px Orbitron', fill: '#ffffff' } );
                Sroids.usernameText = this.game.add.text( this.game.width/2, this.game.height-40, '', { font: '16px Orbitron', fill: '#ffffff' } );
                Sroids.usernameText.anchor.set(0.5);
            break;
            case 'play level':
            {
                if( Sroids.numAsteroids > 0 )
                {
                    // update hud
                    Sroids.livesText.setText( Sroids.player.livesLeft + ' lives left' );
                    Sroids.scoreText.setText( 'Score: ' + Sroids.score );
                    Sroids.levelText.setText( 'Level: ' + Sroids.level );
                    document.getElementById('username').disabled = true;
                    Sroids.username = document.getElementById('username').value;
                    Sroids.usernameText.setText( 'User: ' + Sroids.username );
                    Sroids.highscoreText.setText( 'High: ' + Sroids.highscore );

                    Sroids.player.update();
                    this.manageAsteroids();
                }
                else
                {
                    Sroids.player.kill();
                    this.endLevel();
                }
            }
            break;
            default:
            break;
        }

    },

    manageAsteroids: function()
    {
        var itemScore = 0;
        var asteroidHit = false;

        for( var i = 0; i < Sroids.MAX_ASTEROIDS; i++ )
        {
            var asteroid = Sroids.asteroids[ i ];

            if( asteroid != null && asteroid.doesExist() === true )
            {
                asteroidHit = false;

                asteroid.update();
                var asteroidType = parseInt(asteroid.getType().split('_')[1]);
                for( var j = 0; j < Sroids.player.bullets.length; j++ )
                {
                    var bullet = Sroids.player.bullets.getAt( j );
                    if( bullet != null && bullet.exists === true )
                    {
                        var bulletType = parseInt(bullet.name);
                        if( asteroid.collide( bullet ) === true )
                        {
                            bullet.kill();
                            // ***RFD WORK HERE***
                            if(asteroidType==bulletType){
                                var scale = 1.0;
                                this.goodScreenFlash.flash(0.3, 20);
                            }else{
                                this.juicy.shake();
                                this.badScreenFlash.flash(0.5, 80);
                                var scale = -0.5;
                                this.juicy.jelly(asteroid.clones[asteroid.CENTER], 0.3,
                                        Math.random()*100+100, asteroid.clones[asteroid.CENTER].scale);
                            }
                            if( asteroidType==bulletType || Sroids.KILL_BAD_HITS ){
                                asteroid.explode( 150 );
                                asteroid.kill();
                                Sroids.numAsteroids--;
                                this.manageAsteroidSpawns( asteroid );
                                asteroidHit = true;
                            }
                            if( asteroid.size === 'large' )
                                itemScore = Sroids.LARGE_ASTEROID_SCORE*scale;
                            else if( asteroid.size === 'medium' )
                                itemScore = Sroids.MEDIUM_ASTEROID_SCORE*scale
                            else if( asteroid.size === 'small' )
                                itemScore = Sroids.SMALL_ASTEROID_SCORE*scale;
                            break;
                        }
                    }
                }

                if( !Sroids.player.invincible && asteroidHit === false )
                {
                    if( asteroid.collide( Sroids.player.sprite ) === true )
                    {
                        Sroids.numAsteroids--;

                        this.explode( Sroids.player.sprite.x, Sroids.player.sprite.y, 'large', 150 );
                        Sroids.player.kill();
                        Sroids.player.livesLeft--;
                        if( Sroids.player.livesLeft >= 0 )
                            Sroids.player.reset();
                        else
                            this.endLevel();

                        if( asteroid.size === 'large' )
                            itemScore = Sroids.LARGE_ASTEROID_SCORE;
                        else if( asteroid.size === 'medium' )
                            itemScore = Sroids.MEDIUM_ASTEROID_SCORE;
                        else if( asteroid.size === 'small' )
                            itemScore = Sroids.SMALL_ASTEROID_SCORE;

                        asteroidHit = true;
                    }
                }

                if( asteroidHit === true ) break;
            }

        }  // end for

        Sroids.score += itemScore;
        if( Sroids.score > Sroids.highscore )
            Sroids.highscore = Sroids.score;
    },

    manageAsteroidSpawns: function( asteroid )
    {
        var v_bias_a = 'up';
        var h_bias_a = 'left';
        var v_bias_b = 'up';
        var h_bias_b = 'left';

        // first we check which is closer, horizontal or vertical position
        var h_closer = false;
        var h_len = Sroids.player.sprite.x - asteroid.getX();
        var v_len = Sroids.player.sprite.y - asteroid.getY();

        // next we use player and asteroid position to determine which direction to move along the closer axis.
        if( Math.abs( h_len ) < Math.abs( v_len ) )
            h_closer = true;

        if( h_closer === true )
        {
            // positive means the player was to the right of the asteroid
            // which means we move the asteroid left to get out of the way
            // negative is just the opposite
            if( h_len > 0 )
            {
                h_bias_a = 'left';
                h_bias_b = 'left';
            }
            else
            {
                h_bias_a = 'right';
                h_bias_b = 'right';
            }
            // then we simply move one asteroid in one direction and the second in the other along the opposite axis.
            v_bias_a = 'up';
            v_bias_b = 'down';
        }
        else
        {
            // positive means the player was above the asteroid
            // which means we move the asteroid down to get out of the way
            // negative is just the opposite
            if( v_len > 0 )
            {
                v_bias_a = 'up';
                v_bias_b = 'up';
            }
            else
            {
                v_bias_a = 'down';
                v_bias_b = 'down';
            }
            // then we simply move one asteroid in one direction and the second in the other along the opposite axis.
            h_bias_a = 'left';
            h_bias_b = 'right';
        }

        if( asteroid.size === 'large'  && Sroids.NUM_SIZES>1)
        {

            this.spawnAsteroid( asteroid.getX(), asteroid.getY(), 'medium', h_bias_a, v_bias_a, asteroid.getType() );
            this.spawnAsteroid( asteroid.getX(), asteroid.getY(), 'medium', h_bias_b, v_bias_b, asteroid.getType() );
        }
        else if( asteroid.size === 'medium' && Sroids.NUM_SIZES>2)
        {
            this.spawnAsteroid( asteroid.getX(), asteroid.getY(), 'small', h_bias_a, v_bias_a, asteroid.getType() );
            this.spawnAsteroid( asteroid.getX(), asteroid.getY(), 'small', h_bias_b, v_bias_b, asteroid.getType() );
        }
    },

    startNewLevel: function()
    {
        // set up the time increment the level, and show the level screen
        Sroids.currentTime = this.game.time.now;
        Sroids.gameState = 'level screen';
        Sroids.level++;

        var style = { font: "96px Orbitron", fill: "#0088ff", align: "center" };
        Sroids.levelScreenText = this.game.add.text( this.game.world.centerX, this.game.world.centerY,  'Level: ' + Sroids.level, style);
        Sroids.levelScreenText.anchor.set(0.5);
        Sroids.levelScreenText.setShadow(3,3,'rgba(20,20,20,1)',7);
    },

    endLevel: function()
    {
        // kill stuff
        Sroids.endLevel = true;
        Sroids.livesText.destroy();
        Sroids.scoreText.destroy();
        Sroids.levelText.destroy();
        Sroids.highscoreText.destroy();
        Sroids.player.firekey = null;
        Sroids.player.altFirekey = null;
        this.game.input.keyboard.removeKey( Phaser.Keyboard.A );
        this.game.input.keyboard.removeKey( Phaser.Keyboard.S );

        for( var i = 0; i < Sroids.MAX_ASTEROIDS; i++ )
            Sroids.asteroids[ i ].kill();

        this.send_data('endlevel');

        if( Sroids.player.livesLeft < 0 )
            this.endGame();
        else
            this.startNewLevel();

    },

    // call endLevel to kill stuff then show the game over screen
    endGame: function()
    {
        Sroids.currentTime = this.game.time.now;
        Sroids.gameState = 'game over screen';

        this.send_data('endgame');

        var style = { font: "80px Arial", fill: "#ffbb00", align: "center" };
        Sroids.gameOverScreenText = this.game.add.text( this.game.world.centerX, this.game.world.centerY,  'GAME OVER\nFinal Score\n*\n' + Sroids.score, style );
        Sroids.gameOverScreenText.anchor.set(0.5);
    },

    // explode just sets up an explosion graphic
    explode: function( x, y, size, lifespan )
    {
        var explosion = Sroids.explosions.getFirstExists( false );
        if( explosion != null )
        {
            explosion.x = x;
            explosion.y = y;
            if( size === 'large' )
                explosion.frame = 0;
            else if( size === 'medium' )
                explosion.frame = 1;
            else if( size === 'small' )
                explosion.frame = 2;
            explosion.lifespan = lifespan;
            explosion.revive();
        }
    },

    render: function()
    {
        Sroids.player.render();

        for( var i = 0; i < Sroids.MAX_ASTEROIDS; i++ )
        {
            if( Sroids.asteroids[ i ].doesExist() === true )
                Sroids.asteroids[ i ].render();
        }
    },

    send_data: function(stat_str){
        var data = new FormData();
        data.append('username',Sroids.username);
        data.append('cat', String(Sroids.condNum));
        data.append('level', String(Sroids.level));
        data.append('score', String(Sroids.score));
        data.append('version', Sroids.version);
        data.append("status" , stat_str);
        var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
        xhr.open( 'post', Sroids.server, true );
        xhr.send(data);
    }
}
