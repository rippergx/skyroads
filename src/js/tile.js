var Tile = (function (x, z, h) {
    var mesh, height;

    function init () {
        var g = new THREE.CubeGeometry( 1, 1, 1 );
        var m = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

        mesh = new THREE.Mesh( g, m );
        
        height = h;

        mesh.position.x = x;
        mesh.position.y = 0 + (h / 2);
        mesh.position.z = z;

        mesh._isTile = true;

        update();
    }

    function update() {
        mesh.scale.x = SkyRoads.cell.size.x;
        mesh.scale.y = height || SkyRoads.cell.size.y;
        mesh.scale.z = SkyRoads.cell.size.x;
    }

    init();

    return {
        mesh: mesh,
        update: update
    };
});