import Phaser from '../lib/phaser.js'

export default class Game extends Phaser.Scene {
    /**@type {Phaser.Physics.Arcade.Sprite} */
    player
    
    constructor(){
        super('game')
    }

    preload(){
        this.load.image('background', 'assets/bg_layer1.png')

        //loads the platform image
        this.load.image('platform', 'assets/ground_grass.png')

        //loads the sprite
        this.load.image('bunny-stand', 'assets/bunny1_stand.png')
    }

    create(){
        this.add.image(240, 320, 'background')

        //creates a group
        const platforms = this.physics.add.staticGroup()

        //creates 5 platforms from the group
        for(let i=0; i<5;++i){
            const x = Phaser.Math.Between(80,400)
            const y = 150 * i

            /**@type {Phaser.Physics.Arcade.Sprite} */
            const platform = platforms.create(x, y, 'platform')
            platform.scale = 0.5

            /**@type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body
            body.updateFromGameObject()
        }
        //creates a bunny sprite
        this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5)
        this.physics.add.collider(platforms, this.player)
        
        //Sprite's body will not collid with top, right or left
        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.right = false
        this.player.body.checkCollision.left = false

        this.cameras.main.startFollow(this.player)
    }

    update(){
        // is touching something below it 
        const touchingDown = this.player.body.touching.down

        if(touchingDown){
            //this makes the bunny jump straight up
            this.player.setVelocityY(-300)
        }
    }
} 