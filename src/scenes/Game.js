import Phaser from '../lib/phaser.js'

import Carrot from '../game/Carrot.js'

export default class Game extends Phaser.Scene {

    /**@type {Phaser.GameObjects.Text} */
    carrotsCollectedText

    /**@type {Phaser.Physics.Arcade.Sprite} */
    player
    
    /**@type {Phaser.Physics.Arcade.StaticGroup} */
    platforms

    /**@type {Phaser.Physics.Arcade.Group} */
    carrots

    /**@type {Phaser.Physics.Arcade.CursorKeys} */
    cursors

    constructor(){
        super('game')
    }

    init(){
        this.carrotsCollected = 0
    }

    preload(){
        this.load.image('background', 'assets/bg_layer1.png')

        //loads the platform image
        this.load.image('platform', 'assets/ground_grass.png')

        //loads the sprite
        this.load.image('bunny-stand', 'assets/bunny1_stand.png')
        this.load.image('bunny-jump', 'assets/bunny1_jump.png')

        //loads the jump audio
        this.load.audio('jump', 'assets/phaseJump1.ogg')

        //loads keyboard keys
        this.cursors = this.input.keyboard.createCursorKeys()

        //loads the carrots
        this.load.image('carrot', 'assets/carrot.png')
    }

    create(){
        this.add.image(240, 320, 'background').setScrollFactor(1,0)

        //creates a group
        this.platforms = this.physics.add.staticGroup()

        //creates 5 platforms from the group
        for(let i=0; i<5;++i){
            const x = Phaser.Math.Between(80,400)
            const y = 150 * i

            /**@type {Phaser.Physics.Arcade.Sprite} */
            const platform = this.platforms.create(x, y, 'platform')
            platform.scale = 0.5

            /**@type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body
            body.updateFromGameObject()
        }
        //creates a bunny sprite
        this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5)
        
        //create a carrot
        this.carrots = this.physics.add.group({
            classType: Carrot
        })

        //this.carrots.get(240,320,'carrot')

        this.physics.add.collider(this.platforms, this.player)

        this.physics.add.collider(this.platforms, this.carrots)

        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot,
            undefined,
            this
        )
        
        //Sprite's body will not collid with top, right or left
        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.right = false
        this.player.body.checkCollision.left = false

        this.cameras.main.startFollow(this.player)
        this.cameras.main.setDeadzone(this.scale.width*1.25)

        //text for the score 
        const style = {color: '#000', fontSize: 24}
        this.carrotsCollectedText = this.add.text(80, 10, 'Carrots: 0', style).setScrollFactor(0).setOrigin(0.5,0)
    }

    update(){
        // is touching something below it 
        const touchingDown = this.player.body.touching.down

        if(touchingDown){
            //this makes the bunny jump straight up
            this.player.setVelocityY(-300)

            //switch to jump texture
            this.player.setTexture('bunny-jump')

            //plays jump sound
            this.sound.play('jump')
        }

        const vy = this.player.body.velocity.y
        if(vy > 0 && this.player.texture.key !== 'bunny-stand'){
            //switc back to jump when falling 
            this.player.setTexture('bunny-stand')
        }

        if(this.cursors.left.isDown && !touchingDown){
            this.player.setVelocityX(-200)
        } else if(this.cursors.right.isDown && !touchingDown){
            this.player.setVelocityX(200)
        } else {
            this.player.setVelocityX(0)
        }

        this.platforms.children.iterate(child => {
            /**@type {Phaser.Physics.Arcade.Sprite} */
            const platform = child

            const scrollY = this.cameras.main.scrollY
            if (platform.y >= scrollY + 700){
                platform.y = scrollY - Phaser.Math.Between(50,100)
                platform.body.updateFromGameObject()

                this.addCarrotAbove(platform)
            } 
        })

        this.horizontalWrap(this.player)

        const bottomPlatform = this.findBottomMostPlatform()
        if(this.player.y > bottomPlatform.y + 200){
            this.scene.start('game-over')
        }
    }
    /** @param {Phaser.GameObjects.Sprite} */
    horizontalWrap(sprite){
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth = this.scale.width
        if(sprite.x < -halfWidth){
            sprite.x = gameWidth + halfWidth
        } else if(sprite.x > gameWidth + halfWidth){
            sprite.x = -halfWidth
        }
    }
    /** 
     * @param {Phaser.GameObjects.Sprite} sprite
    */
    addCarrotAbove(sprite){
        const y = sprite.y - sprite.displayHeight

        /** @param {Phaser.Physics.Arcade.Sprite} */
        const carrot = this.carrots.get(sprite.x, y, 'carrot')

        //set active and visible
        carrot.setActive(true)
        carrot.setVisible(true)

        this.add.existing(carrot)

        carrot.body.setSize(carrot.width, carrot.height)

        //make sure body is enabled in the physic world 
        this.physics.world.enable(carrot)

        return carrot
    }
    /** 
     * @param {Phaser.Physics.Arcade.Sprite} player
     * @param {Carrot} carrot
    */
    handleCollectCarrot(player,carrot){
        //hide from display
        this.carrots.killAndHide(carrot)

        //disable from physics world
        this.physics.world.disableBody(carrot.body)

        //increases score by 1
        this.carrotsCollected++
        
        //displays the new score
        const value = `Carrots: ${this.carrotsCollected}`
        this.carrotsCollectedText.text = value
    }

    findBottomMostPlatform(){
        const platforms = this.platforms.getChildren()
        let bottomPlatform = platforms[0]

        for(let i = 1; i < platforms.length; ++i){
            const platform = platforms[i]

            //discard any platforms that are above current 
            if(platform.y < bottomPlatform.y){
                continue
            }
            bottomPlatform = platform
        }
        return bottomPlatform
    }
} 