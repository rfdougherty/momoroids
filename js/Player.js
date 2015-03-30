Player = function(game)
{
    this.game = game;
    this.sprite = null;
    this.cursors = null;
    this.firekey = null;
    this.altFirekey = null;

    this.ship1 = null;
    this.ship2 = null;
    this.ship3 = null;
    this.invincible = false;

    this.currentTime = 0;
    this.invincibleTimer = 0;
};

Player.prototype =
{
    create: function ()
    {
        // Define motion constants
        this.ROT_INC = 22.5;
        this.BASE_ROT = 67.5;
        this.ROTATION_SPEED = this.BASE_ROT; // degrees/second
        this.MAX_ROT = 270;
        this.ACCELERATION = 300; // pixels/second/second
        this.MAX_SPEED = 550; // pixels/second
        this.INVINCIBLE_MS = 3000; // When the player is first created, she's invincible for some time

        //  Our bullet group
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple( 30, 'bullet' );
        this.bullets.setAll( 'anchor.x', 0.5 );
        this.bullets.setAll( 'anchor.y', 1 );
        this.bullets.setAll( 'checkWorldBounds', true );

        for( var i = 0; i < this.bullets.length; i++ )
        {
            var bullet = this.bullets.getAt( i );
            bullet.body.setSize( bullet.width + ( bullet.width / 2 ), bullet.height + ( bullet.height / 2 ) );
        }

        this.livesLeft = 2;

        this.sprite = game.add.sprite( this.game.width / 2, this.game.height / 2, 'ship' );
        this.sprite.kill();

        // Enable physics on the ship
        game.physics.enable( this.sprite, Phaser.Physics.ARCADE );

        // Set maximum velocity
        this.sprite.body.maxVelocity.setTo( this.MAX_SPEED, this.MAX_SPEED ); // x, y
        this.sprite.body.setSize( this.sprite.width - ( this.sprite.width / 3 ), this.sprite.height - ( this.sprite.height / 3 ) );


        this.ship1 = game.add.sprite( this.game.width / 2, this.game.height / 2, 'ship' );
        this.ship1.kill();

        // Enable physics on the ship
        game.physics.enable( this.ship1, Phaser.Physics.ARCADE );

        // Set maximum velocity
        this.ship1.body.maxVelocity.setTo( this.MAX_SPEED, this.MAX_SPEED ); // x, y
        this.ship1.body.setSize( this.ship1.width - ( this.ship1.width / 3 ), this.ship1.height - ( this.ship1.height / 3 ) );

        this.ship2 = game.add.sprite( this.game.width / 2, this.game.height / 2, 'ship' );
        this.ship2.kill();

        // Enable physics on the ship
        game.physics.enable( this.ship2, Phaser.Physics.ARCADE );

        // Set maximum velocity
        this.ship2.body.maxVelocity.setTo( this.MAX_SPEED, this.MAX_SPEED ); // x, y
        this.ship2.body.setSize( this.ship2.width - ( this.ship2.width / 3 ), this.ship2.height - ( this.ship2.height / 3 ) );

        this.ship3 = game.add.sprite( this.game.width / 2, this.game.height / 2, 'ship' );
        this.ship3.kill();

        // Enable physics on the ship
        game.physics.enable( this.ship3, Phaser.Physics.ARCADE );

        // Set maximum velocity
        this.ship3.body.maxVelocity.setTo( this.MAX_SPEED, this.MAX_SPEED ); // x, y
        this.ship3.body.setSize( this.ship3.width - ( this.ship3.width / 3 ), this.ship3.height - ( this.ship3.height / 3 ) );

        // Capture certain keys to prevent their default actions in the browser.
        // This is only necessary because this is an HTML5 game. Games on other
        // platforms may not need code like this.
        game.input.keyboard.addKeyCapture
        ([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN,
            Phaser.Keyboard.SPACEBAR
        ]);

        this.currentTime = this.game.time.now;
        this.invincibleTimer = this.game.time.now;
    },

    reset: function()
    {
        this.bulletTime = 0;
        this.sprite.anchor.setTo( 0.5, 0.5 );
        this.sprite.angle = -90; // Point the ship up
        this.sprite.x = this.game.width / 2;
        this.sprite.y = this.game.height / 2;
        this.sprite.body.velocity.setTo( 0, 0 );
        this.sprite.revive();

        this.ship1.anchor.setTo( 0.5, 0.5 );
        this.ship1.angle = -90; // Point the ship up
        this.ship1.x = this.sprite.x;
        this.ship1.y = this.sprite.y - this.game.height;
        this.ship1.revive();

        this.ship2.anchor.setTo( 0.5, 0.5 );
        this.ship2.angle = -90; // Point the ship up
        this.ship2.x = this.sprite.x - this.game.width;
        this.ship2.y = this.sprite.y - this.game.height;
        this.ship2.revive();

        this.ship3.anchor.setTo( 0.5, 0.5 );
        this.ship3.angle = -90; // Point the ship up
        this.ship3.x = this.sprite.x - this.game.width;
        this.ship3.y = this.sprite.y;
        this.ship3.revive();

        this.currentTime = this.game.time.now;
        this.invincibleTimer = this.game.time.now;
    },

    update: function()
    {

        // let's blink the player while he's invincible
        // this is presumably after he just got killed by an asteroid
        // later on I might have a pick up which does the same thing.
        if( this.invincible )
        {
            // this controls the blinky
            if( this.game.time.now - this.currentTime > 70 )
            {
                this.currentTime = this.game.time.now;
                if( this.sprite.visible )
                    this.sprite.visible = false;
                else if( !this.sprite.visible )
                    this.sprite.visible = true;
            }

            // this controls how long you're invicible
            if( this.game.time.now - this.invincibleTimer > this.INVINCIBLE_MS )
            {
                this.invincibleTimer = this.game.time.now;
                this.invincible = false;
                this.sprite.visible = true;
            }
        }

        this.ship1.x = this.sprite.x;
        if( this.sprite.body.velocity.y < 0 )
            this.ship1.y = this.sprite.y + this.game.height;
        else if( this.sprite.body.velocity.y > 0 )
            this.ship1.y = this.sprite.y - this.game.height;

        if( this.sprite.body.velocity.x < 0 )
            this.ship2.x = this.sprite.x + this.game.width;
        else if( this.sprite.body.velocity.x > 0 )
            this.ship2.x = this.sprite.x - this.game.width;
        if( this.sprite.body.velocity.y < 0 )
            this.ship2.y = this.sprite.y + this.game.height;
        else if( this.sprite.body.velocity.y > 0 )
            this.ship2.y = this.sprite.y - this.game.height;

        if( this.sprite.body.velocity.x < 0 )
            this.ship3.x = this.sprite.x + this.game.width;
        else if( this.sprite.body.velocity.x > 0 )
            this.ship3.x = this.sprite.x - this.game.width;
        this.ship3.y = this.sprite.y;

        // Keep the ship on the screen
        if( this.sprite.x - ( this.sprite.width / 2 ) > this.game.width )
            this.sprite.x -= this.game.width;
        if( this.sprite.x + ( this.sprite.width / 2 )  < 0 )
            this.sprite.x += this.game.width;
        if( this.sprite.y - ( this.sprite.height / 2 ) > this.game.height )
            this.sprite.y -= this.game.height;
        if( this.sprite.y + ( this.sprite.height / 2 )  < 0 )
            this.sprite.y += this.game.height;

        this.ship1.angle = this.sprite.angle;
        this.ship2.angle = this.sprite.angle;
        this.ship3.angle = this.sprite.angle;

        if( this.game.input.keyboard.isDown( Phaser.Keyboard.LEFT ) ||
            this.game.input.keyboard.isDown( Phaser.Keyboard.I ) )
        {
            // If the LEFT key is down, rotate left
            this.sprite.body.angularVelocity = -this.ROTATION_SPEED;
            this.ROTATION_SPEED += this.ROT_INC;
            if( this.ROTATION_SPEED > this.MAX_ROT )
                this.ROTATION_SPEED = this.MAX_ROT;
        }
        else if ( this.game.input.keyboard.isDown( Phaser.Keyboard.RIGHT ) ||
            this.game.input.keyboard.isDown( Phaser.Keyboard.P ) )
        {
            // If the RIGHT key is down, rotate right
            this.sprite.body.angularVelocity = this.ROTATION_SPEED;
            this.ROTATION_SPEED += this.ROT_INC;
            if( this.ROTATION_SPEED > this.MAX_ROT )
                this.ROTATION_SPEED = this.MAX_ROT;
        }
        else
        {
            // Stop rotating
            this.sprite.body.angularVelocity = 0;
            this.ROTATION_SPEED = this.BASE_ROT;
        }

        if( this.game.input.keyboard.isDown( Phaser.Keyboard.UP ) ||
            this.game.input.keyboard.isDown( Phaser.Keyboard.NINE ) )
        {
            // If the UP key is down, thrust
            // Calculate acceleration vector based on this.angle and this.ACCELERATION
            this.sprite.body.acceleration.x = Math.cos( this.sprite.rotation ) * this.ACCELERATION;
            this.sprite.body.acceleration.y = Math.sin( this.sprite.rotation ) * this.ACCELERATION;

            this.sprite.body.drag.setTo( 0, 0 );

            // Show the frame from the spritesheet with the engine on
            this.sprite.frame = 1;
            this.sprite.body.maxVelocity.setTo( this.MAX_SPEED, this.MAX_SPEED ); // x, y


        }
        else if( this.game.input.keyboard.isDown( Phaser.Keyboard.DOWN ) ||
            this.game.input.keyboard.isDown( Phaser.Keyboard.O ) )
        {
            // If the UP key is down, thrust
            // Calculate acceleration vector based on this.angle and this.ACCELERATION
            this.sprite.body.acceleration.x = -( Math.cos( this.sprite.rotation ) * ( this.ACCELERATION / 4 ) );
            this.sprite.body.acceleration.y = -( Math.sin( this.sprite.rotation ) * ( this.ACCELERATION / 4 ) );

            this.sprite.body.drag.setTo( 0, 0 );

            // Show the frame from the spritesheet with the engine on
            this.sprite.frame = 2;

            this.sprite.body.maxVelocity.setTo( this.MAX_SPEED / 2, this.MAX_SPEED / 2 ); // x, y
        }
        else
        {
            // Otherwise, stop thrusting
            this.sprite.body.acceleration.setTo( 0, 0 );
            this.sprite.body.drag.setTo( 5, 5 );

            // Show the frame from the spritesheet with the engine off
            this.sprite.frame = 0;
        }

        this.bullets.forEachExists( this.wrapAround, this );
    },

    wrapAround: function( currentBullet )
    {
        //if( currentBullet.x > this.game.width ) currentBullet.x = 0;
        //if( currentBullet.x < 0 )currentBullet.x = this.game.width;
        //if( currentBullet.y > this.game.height ) currentBullet.y = 0;
        //if(currentBullet.y < 0 ) currentBullet.y = this.game.height;
        if( currentBullet.x > this.game.width
           || currentBullet.x < 0
           || currentBullet.y > this.game.height
           || currentBullet.y < 0 )
            currentBullet.kill();
    },

    fireBullet: function( name )
    {
        //  To avoid them being allowed to fire too fast we set a time limit
        if( this.game.time.now > this.bulletTime )
        {
            //  Grab the first bullet we can from the pool
            this.bullet = this.bullets.getFirstExists( false );

            if( this.bullet )
            {
                //  And fire it
                this.bullet.reset( this.sprite.x, this.sprite.y );
                this.bullet.body.velocity.x = this.sprite.body.velocity.x + ( Math.cos( this.sprite.rotation ) * 400 );  //( this.sprite.body.velocity.x + 400 );
                this.bullet.body.velocity.y = this.sprite.body.velocity.y + ( Math.sin( this.sprite.rotation ) * 400 ); //( this.sprite.body.velocity.y + 400 );
                this.bulletTime = this.game.time.now + 400;
                this.bullet.lifespan = 1500;
                this.bullet.name = name;
            }
        }
    },


    kill: function()
    {
        this.bullets.callAll( 'kill', null );
        this.sprite.kill();
        this.ship1.kill();
        this.ship2.kill();
        this.ship3.kill();
        this.invincible = true;
    },

    render: function()
    {
        //if( this.sprite != null ) this.game.debug.body( this.sprite, 'rgba(255,0,0,0.4)' );
        //if( this.ship1 != null ) this.game.debug.body( this.ship1, 'rgba(0,255,0,0.4)' );
        //if( this.ship2 != null ) this.game.debug.body( this.ship2, 'rgba(0,0,255,0.4)' );
        //if( this.ship3 != null ) this.game.debug.body( this.ship3, 'rgba(255,255,0,0.4)' );
    }
};
