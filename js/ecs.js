var Position = CES.Component.extend({
    name: 'position',
    init: function (x, y) {
        this.x = x;
        this.y = y;
    }
});
var Velocity = CES.Component.extend({
    name: 'velocity',
    init: function (x, y) {
        this.x = x;
        this.y = y;
    }
});
var Health = CES.Component.extend({
    name: 'health',
    init: function (maxHealth) {
        this.health = this.maxHealth = maxHealth;
    },
    isDead: function () {
        return this.health <= 0;
    },
    receiveDamage: function (damage) {
        this.health -= damage;
    }
});
var BoundingBox = CES.Component.extend({
    name: 'bounding_box',
    init: function(w, h) {
        this.w = w;
        this.h = h;
    }
});
var TextureC = CES.Component.extend({
    name: 'textured',
    init: function(tex) {
        this.texture = tex;
        this.sprite = new PIXI.Sprite(tex);
    }
});
var Named = CES.Component.extend({
    name: 'named',
    init: function(name) {
        this.myname = name;
    }
});
var PhysicSystem = CES.System.extend({
    update: function (dt) {
        var entities, position, velocity;
        entities = this.world.getEntities('position', 'velocity');
        entities.forEach(function (entity) {
            position = entity.getComponent('position');
            velocity = entity.getComponent('velocity');
            position.x += velocity.x * dt/1000;
            position.y += velocity.y * dt/1000;
        });
    }
});


var EntityManager = function() {
    this.world = new CES.World();
    this.world.addSystem(new PhysicSystem());
};
EntityManager.prototype.loadObjects = function(objs) {
    for (var i = 0; i < objs.length; i++) {
        var o = objs[i];
        var e = new CES.Entity();
        e.addComponent(new Position(o.x, o.y));
        if(o.name)
            e.addComponent(new Named(o.name));
        e.addComponent(new Velocity(0, 0));
        e.addComponent(new BoundingBox(o.width, o.height));
        e.addComponent(new TextureC(o.texture));
        this.world.addEntity(e);
    }
};
