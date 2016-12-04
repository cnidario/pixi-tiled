var renderer;
function start() {
    renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor : 0x1099bb}, true);
    renderer.smoothProperty = true;
    document.getElementById('content').appendChild(renderer.view);
    PIXI.loader.add('medieval_tilesheet.png','../assets/medieval_tilesheet.png')
    .add('map','../assets/small-map.json')
    .add('medieval-ts', '../assets/medieval-ts.json')
    .add('mage', '../assets/mage.png')
    .load(function() {
        init();

        var then = Date.now();
        var fps = 30;
        var interval = 1000/fps;
        (function draw() {
            requestAnimationFrame(draw);
            now = Date.now();
            var dt = now - then;
            if(dt > interval) {
                then = now - (dt % interval);
                update(dt);
                render();
            }
        })();
    });
}

var leftkey = keyboard(37),
    upkey = keyboard(38),
    rightkey = keyboard(39),
    downkey = keyboard(40),
    zkey = keyboard(90),
    xkey = keyboard(88);


    var Camera = function(w, h) {
        this.x = undefined;
        this.y = undefined;
        this.w = w;
        this.h = h;
    };
    Camera.prototype.transformMatrix = function() {
        var trans = new PIXI.Matrix();
        trans.translate(- (this.x + this.w*0.5), - (this.y + this.h*0.5));
        return trans;
    };
    Camera.prototype.follow = function(object) {
        var p = object.getComponent('position');
        this.x = p.x - 200;
        this.y = p.y - 200;
    };
    var World = function() {
    };
    var GameScene = function(world, camera) {
        this.camera = camera;
        this.player = undefined;
        this.world = world;
    };
    GameScene.prototype.renderEntities = function(renderer, transform, debug) {
        var entities, position, texture;
        entities = this.world.em.world.getEntities('position', 'textured');
        entities.forEach(function(entity) {
            position = entity.getComponent('position');
            texture = entity.getComponent('textured');
            var bbox = entity.getComponent('bounding_box');
            texture.sprite.x = position.x + transform.tx;
            texture.sprite.y = position.y + transform.ty;
            if(texture.texture && bbox) { //ajustar el bounding box al punto central
                var wtex = texture.texture.width, htex = texture.texture.height;
                texture.sprite.x -= (wtex - bbox.w)*0.5
                texture.sprite.y -= (htex - bbox.h)*0.5;
            }

            renderer.render(texture.sprite, undefined, false); //FIXME bug o algo
            if(debug) {
                var g = new PIXI.Graphics();
                g.lineStyle(2, 0xcccccc);
                g.moveTo(0, 0);
                g.lineTo(0, bbox.h);
                g.lineTo(bbox.w, bbox.h);
                g.lineTo(bbox.w, 0);
                g.lineTo(0, 0);
                g.x = position.x + transform.tx;
                g.y = position.y + transform.ty;
                renderer.render(g, undefined, false);
            }
        });
    };
    GameScene.prototype.render = function(renderer, debug) {
        this.camera.follow(this.player);
        var tr = this.camera.transformMatrix();
        this.world.map.x = tr.tx;
        this.world.map.y = tr.ty;
        //XXX Matrix transforms no funcionan en ninguna de sus formas.
        //render map
        renderer.render(this.world.map, undefined, true);
        //render object layers
        this.renderEntities(renderer, tr, debug);

    };

//var interactionManager = PIXI.interaction.InteractionManager(renderer);
var debugInfo = {
    debug: false
};
function debugGUI() {
    var gui = new dat.GUI({ autoPlace: false });
    var c;
    c = gui.add(debugInfo, 'debug', true, false);
    document.getElementById('content').appendChild(gui.domElement);
    gui.domElement.setAttribute('id', 'gui');
}

var scene;
function init() {
    scene = new GameScene(new World(), new Camera(0,0,renderer.width, renderer.height));
    var em = scene.world.em = new EntityManager();

    var tileset = new Tileset();
    tileset.load(PIXI.loader.resources['medieval-ts'].data, 1);
    var tloader = new TileLayerLoader(tileset);
    var map_data = PIXI.loader.resources['map'].data;
    scene.world.map = tloader.loadTileLayers(map_data['layers']);
    var olayers = tloader.loadObjectLayers(map_data['layers']);
    for (var i = 0; i < olayers.length; i++) {
        em.loadObjects(olayers[i]);
    }
    var hero = em.world.getEntities('named').find(function(x) {
        return x.getComponent('named').myname == 'hero';
    });
    scene.player = hero;
    debugGUI();
}
function update(dt) {
    //XXX desplazamientos o transformaciones float producen gaps visuales (líneas)
    //entre tiles a causa del rounding, en scale no se puede evitar porque suelen
    //ser factores con decimales
    scene.world.em.world.update(dt);

    var hero_v = scene.player.getComponent('velocity');

    var mov = function(obj_v, compo, speed, keypos, keyneg) {
        obj_v[compo] = keypos.isDown? speed : (keyneg.isDown? -speed : 0);
    };
    mov(hero_v, 'y', 100, downkey, upkey);
    mov(hero_v, 'x', 100, rightkey, leftkey);
    if(zkey.isDown) {
        var zoom = scene.world.map.scale.x + dt/1000 * 0.2;
        scene.world.map.scale.x = zoom;
        scene.world.map.scale.y = zoom;
    }
    if(xkey.isDown) {
        var zoom = scene.world.map.scale.x - dt/1000 * 0.2;
        scene.world.map.scale.x = zoom;
        scene.world.map.scale.y = zoom;
    }
}
function render() {
    scene.render(renderer, debugInfo.debug);
}
start();
