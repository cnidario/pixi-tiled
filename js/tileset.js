var Tileset = function() {
    this.tiles = [];
};
Tileset.prototype.load = function(tileset_data, first_id) {
    var imtex = PIXI.loader.resources[tileset_data['image']].texture;
    this.tw = tileset_data['tilewidth'];
    this.th = tileset_data['tileheight'];
    var margin = tileset_data['margin'],
        spacing = tileset_data['spacing'],
        columns = tileset_data['columns'],
        count = tileset_data['tilecount'];
    this.tiles = [];
    for(var i = first_id; i < count; i++) {
        var col = (i - 1) % columns,
            row = Math.floor((i - 1) / columns);
        var x = margin + col * (this.tw + spacing),
            y = margin + row * (this.th + spacing);
        this.tiles.push(new PIXI.Texture(imtex, new PIXI.Rectangle(x, y, this.tw, this.th)));
    }
};
Tileset.prototype.tileById = function(id) {
    return this.tiles[id - 1];
};

function spriteAt(x, y) {
    var sprite = new PIXI.Sprite();
    sprite.x = x;
    sprite.y = y;
    return sprite;
}
var TileLayerLoader = function(tileset) {
    this.tileset = tileset;
};
TileLayerLoader.prototype.loadTileLayer = function(layer_data) {
    this.cols = layer_data['width'];
    this.rows = layer_data['height'];
    var data = layer_data['data'];
    var layer = new PIXI.Container();
    for(var row = 0; row < this.rows; row++)
        for(var col = 0; col < this.cols; col++) {
            var x = col * this.tileset.tw, y = row * this.tileset.th;
            var spr = spriteAt(x, y);
            var gid = data[col + row * this.cols];
            if(gid != 0) {
                spr.texture = this.tileset.tileById(data[col + row * this.cols]);
                layer.addChild(spr);
            }
        }
    return layer;
};
TileLayerLoader.prototype.loadObjectLayer = function(layer_data) {
    var objects = layer_data['objects'];
    var objs = [];
    for(var i = 0; i < objects.length; i++) {
        var o = objects[i];
        objs.push({
            id: o.id,
            name: o.name,
            x: o.x,
            y: o.y,
            width: o.width,
            height: o.height,
            texture: this.tileset.tileById(o.gid || o.properties.gid)
        });
    }
    return objs;
};
TileLayerLoader.prototype.loadTileLayers = function(layers_data) {
    var map = new PIXI.Container();
    for (var i = 0; i < layers_data.length; i++) {
        if(layers_data[i]['type'] == 'tilelayer')
            map.addChild(this.loadTileLayer(layers_data[i]));
    }
    return map;
};
TileLayerLoader.prototype.loadObjectLayers = function(layers_data) {
    var ls = [];
    for (var i = 0; i < layers_data.length; i++) {
        if(layers_data[i]['type'] == 'objectgroup')
            ls.push(this.loadObjectLayer(layers_data[i]));
        }
    return ls;
};
