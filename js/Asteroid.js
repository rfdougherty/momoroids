Asteroid = function( game ){
    this.game = game;

    this.clones = [];

    this.explosions = [];

    this.type = 'ast_0_0';
    this.size = 'large';

    this.xPos = 0;
    this.yPos = 0;

    this.baseXSpeed = 0;
    this.baseYSpeed = 0;
    this.baseXLimit = 0;
    this.baseYLimit = 0;

    this.xSpeed = 0;
    this.ySpeed = 0;
    this.xVel = 0;
    this.yVel = 0;

    this.width = 32;
    this.height = 32;

    this.NUM_CLONES = 9;

    this.CENTER    = 0;
    this.NORTH     = 1;
    this.NORTHEAST = 2;
    this.EAST      = 3;
    this.SOUTHEAST = 4;
    this.SOUTH     = 5;
    this.SOUTHWEST = 6;
    this.WEST      = 7;
    this.NORTHWEST = 8;

    this.exists = false;

    this.mode = 'lifeless';

    this.canBeSentient = false;

    this.driftTimer = this.game.time.now + 1001;  // we want this to start right away.
    this.driftTime = 1000;
};

Asteroid.prototype = {
    create: function( x, y ){
        for( var i = 0; i < this.NUM_CLONES; i++ ){
            this.clones[ i ] = this.game.add.sprite( x, y, 'ast_sheet' );
            this.clones[ i ].kill();

            this.clones[ i ].animations.add( 'ast_0_0', [ 0 ], 60, true );
            this.clones[ i ].animations.add( 'ast_0_1', [ 2 ], 60, true );
            this.clones[ i ].animations.add( 'ast_0_2', [ 4 ], 60, true );
            this.clones[ i ].animations.add( 'ast_0_3', [ 6 ], 60, true );
            this.clones[ i ].animations.add( 'ast_0_4', [ 8 ], 60, true );
            this.clones[ i ].animations.add( 'ast_0_5', [ 10 ], 60, true );
            this.clones[ i ].animations.add( 'ast_0_6', [ 12 ], 60, true );
            this.clones[ i ].animations.add( 'ast_1_0', [ 1 ], 60, true );
            this.clones[ i ].animations.add( 'ast_1_1', [ 3 ], 60, true );
            this.clones[ i ].animations.add( 'ast_1_2', [ 5 ], 60, true );
            this.clones[ i ].animations.add( 'ast_1_3', [ 7 ], 60, true );
            this.clones[ i ].animations.add( 'ast_1_4', [ 9 ], 60, true );
            this.clones[ i ].animations.add( 'ast_1_5', [ 11 ], 60, true );
            this.clones[ i ].animations.add( 'ast_1_6', [ 13 ], 60, true );

            // Enable physics
            this.game.physics.enable( this.clones[ i ], Phaser.Physics.ARCADE );

            this.clones[ i ].anchor.x = 0.5;
            this.clones[ i ].anchor.y = 0.5;

            this.explosions[ i ] = this.game.add.sprite( x, y, 'explode_large' );
            this.explosions[ i ].anchor.x = 0.5;
            this.explosions[ i ].anchor.y = 0.5;
            this.explosions[ i ].kill();
        }

        // sets all 9 sprites
        this.setX( x );
        this.setY( y );


        // setting size based on the first sprite's size
        this.setWidth( this.clones[ this.CENTER ].width );
        this.setHeight( this.clones[ this.CENTER ].height );
        this.baseXSpeed = 0.25;
        this.baseYSpeed = 1.0;

        //this.wrap();
    },

    init: function( x, y ){
        this.setX( x );
        this.setY( y );
    },

    getMode: function(){
        return this.mode;
    },

    setMode: function( mode ){
        this.mode = mode;
    },

    handleWrapping: function( i, asteroid ){
        var wrapL = 0;
        var wrapR = this.game.width;
        var wrapT = 0;
        var wrapB = this.game.height;

        switch( i ){
            case this.NORTH:{
                wrapL = 0;
                wrapR = this.game.width;

                wrapT = -this.game.height;
                wrapB = 0;
            }
            break;

            case this.NORTHEAST:{
                wrapL = this.game.width;
                wrapR = this.game.width * 2;

                wrapT = -this.game.height;
                wrapB = 0;
            }
            break;

            case this.EAST:{
                wrapL = this.game.width;
                wrapR = this.game.width * 2;

                wrapT = 0;
                wrapB = this.game.height;
            }
            break;

            case this.SOUTHEAST:{
                wrapL = this.game.width;
                wrapR = this.game.width * 2;

                wrapT = this.game.height;
                wrapB = this.game.height * 2;
            }
            break;

            case this.SOUTH:{
                wrapL = 0;
                wrapR = this.game.width;

                wrapT = this.game.height;
                wrapB = this.game.height * 2;
            }
            break;

            case this.SOUTHWEST:{
                wrapL = -this.game.width;
                wrapR = 0;

                wrapT = this.game.height;
                wrapB = this.game.height * 2;
            }
            break;

            case this.WEST:{
                wrapL = -this.game.width;
                wrapR = 0;

                wrapT = 0;
                wrapB = this.game.height;
            }
            break;

            case this.NORTHWEST:{
                wrapL = -this.game.width;
                wrapR = 0;

                wrapT = -this.game.height;
                wrapB = 0;
            }
            break;
        }

        if( asteroid.x - ( asteroid.width / 2 ) > wrapR ){
            asteroid.x -= this.game.width;
        }
        if( asteroid.x + ( asteroid.width / 2 )  < wrapL ){
            asteroid.x += this.game.width;
        }

        if( asteroid.y - ( asteroid.height / 2 ) > wrapB ){
            asteroid.y -= this.game.height;
        }
        if( asteroid.y + ( asteroid.height / 2 )  < wrapT ){
            asteroid.y += this.game.height;
        }
    },

    manageVisibility: function( asteroid ){
        if( asteroid.x + ( asteroid.width / 2 ) < 0 ||
            asteroid.x - ( asteroid.width / 2 ) > this.game.world.width ||
            asteroid.y + ( asteroid.height / 2 ) < 0 ||
            asteroid.y - ( asteroid.height / 2 ) > this.game.world.height )
        {
            asteroid.visible = false;
        }
        else{
            asteroid.visible = true;
        }
    },

    // so the magical update function
    update: function() {
        for( var i = 0; i < this.NUM_CLONES; i++ ){
            var asteroid = this.clones[ i ];

            if( asteroid.exists === true ){
                this.handleWrapping( i, asteroid );
                this.manageVisibility( asteroid );

            }  // end if exists

        }  // end for
    },

    doDriftMove: function(){
        if( this.canBeSentient === true ){
            if( this.game.time.now - this.driftTimer > this.driftTime ){
                this.driftTimer = this.game.time.now;


            }
        }
    },

    turnOnSentientAbility: function(){
        this.canBeSentient = true;
    },

    turnOffSentientAbility: function(){
        this.canBeSentient = false;
    },

    playAnim: function( anim ){
        for( var i = 0; i < this.NUM_CLONES; i++ ){
            this.clones[ i ].play( anim );
        }
    },

    setScale: function( scaleX, scaleY ){
        for( var i = 0; i < this.NUM_CLONES; i++ ){
            this.clones[ i ].scale.setTo( scaleX, scaleY );
        }
    },

    // explode just sets up an explosion graphic
    explode: function( lifespan ){
        for( var i = 0; i < this.NUM_CLONES; i++ ){
            var explosion = this.explosions[ i ];
            if( explosion != null ){
                explosion.x = this.clones[ i ].x;
                explosion.y = this.clones[ i ].y;
                if( this.size === 'large' )
                    explosion.loadTexture( 'explode_large' );
                else if( this.size === 'medium' )
                    explosion.loadTexture( Sroids.bmd_med );
                else if( this.size === 'small' )
                    explosion.loadTexture( Sroids.bmd_sml );
                explosion.lifespan = lifespan;
                explosion.revive();
            }
        }
    },

    collide: function( sprite ){
        var cloneHit = false;
        for( var i = 0; i < this.NUM_CLONES; i++ ){
            var clone = this.clones[ i ];
            if( clone.visible === true ){
                if( this.game.physics.arcade.overlap( clone, sprite ) === true ){
                    this.explode( 150 );
                    cloneHit = true;
                    break;
                }
            }
        }

        if( cloneHit === true )
            this.kill();

        return cloneHit;
    },

    doesExist: function(){
        return this.exists;
    },

    kill: function(){
        this.exists = false;
        for( var i = 0; i < this.NUM_CLONES; i++ ){
            this.clones[ i ].kill();
        }
    },

    revive: function(){
        this.exists = true;
        for( var i = 0; i < this.NUM_CLONES; i++ ){
            this.clones[ i ].revive();
        }
    },

    getType: function(){
        return this.type;
    },

    setType: function( type ){
        this.type = type;
        for( var i = 0; i < this.NUM_CLONES; i++ ){
            this.clones[ i ].play( this.type );
        }
    },

    getX: function(){
        //return this.xPos;
        return this.clones[ this.CENTER ].x;
    },

    setX: function( x ){
        this.xPos = x;

        if( this.clones[ this.CENTER ] != null ){
            this.clones[ this.CENTER ].x = this.xPos;
        }

        if( this.clones[ this.NORTH ] != null ){
            this.clones[ this.NORTH ].x = this.xPos;
        }

        if( this.clones[ this.NORTHEAST ] != null ){
            this.clones[ this.NORTHEAST ].x = this.xPos + this.game.width;
        }

        if( this.clones[ this.EAST ] != null ){
            this.clones[ this.EAST ].x = this.xPos + this.game.width;
        }

        if( this.clones[ this.SOUTHEAST ] != null ){
            this.clones[ this.SOUTHEAST ].x = this.xPos + this.game.width;
        }

        if( this.clones[ this.SOUTH ] != null ){
            this.clones[ this.SOUTH ].x = this.xPos;
        }

        if( this.clones[ this.SOUTHWEST ] != null ){
            this.clones[ this.SOUTHWEST ].x = this.xPos - this.game.width;
        }

        if( this.clones[ this.WEST ] != null ){
            this.clones[ this.WEST ].x = this.xPos - this.game.width;
        }

        if( this.clones[ this.NORTHWEST ] != null ){
            this.clones[ this.NORTHWEST ].x = this.xPos - this.game.width;
        }
    },

    getY: function(){
        //return this.yPos;
        return this.clones[ this.CENTER ].y;
    },

    setY: function( y ){
        this.yPos = y;

        if( this.clones[ this.CENTER ] != null ){
            this.clones[ this.CENTER ].y = this.yPos;
        }

        if( this.clones[ this.NORTH ] != null ){
            this.clones[ this.NORTH ].y = this.yPos - this.game.height;
        }

        if( this.clones[ this.NORTHEAST ] != null ){
            this.clones[ this.NORTHEAST ].y = this.yPos - this.game.height;
        }

        if( this.clones[ this.EAST ] != null ){
            this.clones[ this.EAST ].y = this.yPos;
        }

        if( this.clones[ this.SOUTHEAST ] != null ){
            this.clones[ this.SOUTHEAST ].y = this.yPos + this.game.height;
        }

        if( this.clones[ this.SOUTH ] != null ){
            this.clones[ this.SOUTH ].y = this.yPos + this.game.height;
        }

        if( this.clones[ this.SOUTHWEST ] != null ){
            this.clones[ this.SOUTHWEST ].y = this.yPos + this.game.height;
        }

        if( this.clones[ this.WEST ] != null ){
            this.clones[ this.WEST ].y = this.yPos;
        }

        if( this.clones[ this.NORTHWEST ] != null ){
            this.clones[ this.NORTHWEST ].y = this.yPos - this.game.height;
        }
    },

    getXVel: function(){
        return this.xVel;
    },

    setXVel: function( x ){
        this.xVel = x;

        for( var i = 0; i < this.NUM_CLONES; i++ ){
            if( this.clones[ i ] != null ){
                this.clones[ i ].body.velocity.x = this.xVel;
            }
        }
    },

    getYVel: function(){
        return this.yVel;
    },

    setYVel: function( y ){
        this.yVel = y;

        for( var i = 0; i < this.NUM_CLONES; i++ ){
            if( this.clones[ i ] != null ){
                this.clones[ i ].body.velocity.y = this.yVel;
            }
        }
    },

    getXSpeed: function(){
        return this.xSpeed;
    },

    setXSpeed: function( x ){
        this.xSpeed = x;
    },

    getYSpeed: function(){
        return this.ySpeed;
    },

    setYSpeed: function( y ){
        this.ySpeed = y;
    },

    getBaseXSpeed: function(){
        return this.baseXSpeed;
    },

    setBaseXSpeed: function( x ){
        this.baseXSpeed = x;
    },

    getBaseYSpeed: function(){
        return this.baseYSpeed;
    },

    setBaseYSpeed: function( y ){
        this.baseYSpeed = y;
    },

    getBaseXLimit: function(){
        return this.baseXLimit;
    },

    setBaseXLimit: function( x ){
        this.baseXLimit = x;
    },

    getBaseYLimit: function(){
        return this.baseLimit;
    },

    setBaseYLimit: function( y ){
        this.baseYLimit = y;
    },

    incBaseSpeed: function( xAmount, yAmount ){
        if( this.baseXSpeed < this.baseXLimit )
            this.baseXSpeed += xAmount;
        if( this.baseYSpeed < this.baseYLimit )
            this.baseYSpeed += yAmount;
    },

    getWidth: function(){
        return this.width;
    },

    setWidth: function( x ){
        this.width = x;

        for( var i = 0; i < this.NUM_CLONES; i++ ){
            if( this.clones[ i ] != null ){
                this.clones[ i ].body.width = this.width;
            }
        }
    },

    getHeight: function(){
        return this.height;
    },

    setHeight: function( y ){
        this.height = y;

        for( var i = 0; i < this.NUM_CLONES; i++ ){
            if( this.clones[ i ] != null ){
                this.clones[ i ].body.height = this.height;
            }
        }
    },

    render: function(){
        // Uncomment the following to see the collision rectangles
    /*
        var color = 'rgba(255,0,0,0.40)';

        for( var i = 0; i < this.NUM_CLONES; i++ ){
            switch( i ){
                case this.CENTER:
                    color = 'rgba( 255, 255, 255, 0.4 )';
                break;

                case this.NORTH:
                    color = 'rgba( 255, 0, 0, 0.4 )';
                break;

                case this.NORTHEAST:
                    color = 'rgba( 0, 255, 0, 0.4 )';
                break;

                case this.EAST:
                    color = 'rgba( 0, 0, 255, 0.4 )';
                break;

                case this.SOUTHEAST:
                    color = 'rgba( 255, 255, 0, 0.4 )';
                break;

                case this.SOUTH:
                    color = 'rgba( 255, 0, 255, 0.4 )';
                break;

                case this.SOUTHWEST:
                    color = 'rgba( 0, 255, 255, 0.4 )';
                break;

                case this.WEST:
                    color = 'rgba( 255, 192, 63, 0.4 )';
                break;

                case this.NORTHWEST:
                    color = 'rgba( 127, 127, 127, 0.4 )';
                break;

            }  // end switch

            var asteroid = this.clones[ i ];
            if( asteroid.visible === true )
                this.game.debug.body( asteroid, color );
        }  // end for
    //*/
    }

};
