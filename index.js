const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

ctx.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './img/background.png'
})

const shop = new Sprite({
    position: {
        x: 600,
        y: 128
    },
    imageSrc: './img/shop.png',
    scale: 2.75,
    framesMax: 6
})

const player = new Fighter({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 10
    },
    color: 'red',
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './img/lui/Idle.png',
    framesMax: 10,
    scale: 2.5,
    offset: {
        x: 100,
        y: 50
    },
    sprites: {
        idle: {
            imageSrc: './img/lui/Idle.png',
            framesMax: 10
        },
        run: {
            imageSrc: './img/lui/Run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './img/lui/Going Up.png',
            framesMax: 3,
        },
        fall: {
            imageSrc: './img/lui/Going Down.png',
            framesMax: 3,
        },
        attack1: {
            imageSrc: './img/lui/Attack1.png',
            framesMax: 7,
        },
        takeHit: {
            imageSrc: './img/lui/Take Hit.png',
            framesMax: 3,
        },
        death: {
            imageSrc: './img/lui/Death.png',
            framesMax: 11,
        }
    },
    attackBox: {
        offset: {
            x: 100,
            y: 50
        },
        width: 120,
        height: 50
    }
})

const enemy = new Fighter({
    position: {
        x: 960,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: './img/kenji/Idle.png',
    framesMax: 4,
    scale: 2.5,
    offset: {
        x: 240,
        y: 167
    },
    sprites: {
        idle: {
            imageSrc: './img/kenji/Idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './img/kenji/Run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './img/kenji/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/kenji/Fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './img/kenji/Attack1.png',
            framesMax: 4,
        },
        takeHit: {
            imageSrc: './img/kenji/Take hit.png',
            framesMax: 3,
        },
        death: {
            imageSrc: './img/kenji/Death.png',
            framesMax: 7,
        }
    },
    attackBox: {
        offset: {
            x: -170,
            y: 50
        },
        width: 170,
        height: 50
    }
})

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}

function animate() {
    window.requestAnimationFrame(animate)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    shop.update()

    // give white overlay
    ctx.fillStyle = 'rgba(255,255,255,  0.15)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    player.update()
    enemy.update()

    //player movement
    player.velocity.x = 0
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }

    //player jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }

    //enemy movement
    enemy.velocity.x = 0
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    //enemy jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }

    //detect attack collision for player & enemy gets hit
    if (rectangularCollision({ rectangle1: player, rectangle2: enemy }) && player.isAttacking && player.framesCurrent === 4) {
        enemy.takeHit(25)
        player.isAttacking = false

        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        })
    }
    // if player misses
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false
    }

    //detect attack collision for enemy & player gets hit
    if (rectangularCollision({ rectangle1: enemy, rectangle2: player }) && enemy.isAttacking && enemy.framesCurrent === 2) {
        player.takeHit(20)
        enemy.isAttacking = false
        console.log("enemy attack successful")
        gsap.to('#playerHealth', {
            width: player.health + '%'
        })
    }

    // if enemy misses
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false
    }

    //end game base on health
    if (player.health <= 0 || enemy.health <= 0) {
        determineWinner({ player, enemy, timerId })
    }
}

animate()

window.addEventListener('keydown', (event) => {
    if (!player.dead) {
        playerKeyEvents(event.key)
    }
    if (!enemy.dead) {
        enemyKeyEvents(event.key)
    }
})

window.addEventListener('keyup', (event) => {
    playerKeyEvents(event.key,true)
    enemyKeyEvents(event.key,true)
})

function playerKeyEvents(keyType, keyUp = false) {
    var keysDown = {
        'd': function () {
            keys.d.pressed = true
            player.lastKey = 'd'
        },
        'a': function () {
            keys.a.pressed = true
            player.lastKey = 'a'
        },
        'w': function () {
            player.velocity.y = -20
        },
        ' ': function () {
            player.attack()
        }
    }
    var keysUp = {
        'd': function () {
            keys.d.pressed = false
        },
        'a': function () {
            keys.a.pressed = false
        },
    }
    try {
        keysDown[keyType]()
        if (keyUp) {
            keysUp[keyType]()
        }
    } catch (e) {
        //eat the TypeError
    }
}

function enemyKeyEvents(keyType, keyUp = false) {
    var keysDown = {
        'ArrowRight': function () {
            keys.ArrowRight.pressed = true
            enemy.lastKey = 'ArrowRight'
        },
        'ArrowLeft': function () {
            keys.ArrowLeft.pressed = true
            enemy.lastKey = 'ArrowLeft'
        },
        'ArrowUp': function () {
            enemy.velocity.y = -20
        },
        'ArrowDown': function () {
            enemy.attack()
        }
    }
    var keysUp = {
        'ArrowRight': function () {
            keys.ArrowRight.pressed = false
        },
        'ArrowLeft': function () {
            keys.ArrowLeft.pressed = false
        },
    }
    try {
        keysDown[keyType]()
        if (keyUp) {
            keysUp[keyType]()
        }
    } catch (e) {
        //eat the TypeError
    }
}

