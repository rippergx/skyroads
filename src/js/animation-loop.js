var Scene = (function () {
    var scene, renderer;

    var vehicle, camera, keyboard;
    
    var currentTime = new Date().getTime();

    var initScene = function init() {

        scene = new THREE.Scene();

        _.each(Level.getTiles(), function(tile) {
            var t = tile;
            scene.add(t.mesh);
        });
        
        keyboard = new Keyboard();
        vehicle = new Vehicle();
        scene.add(vehicle.mesh);

        camera = new Camera();

        renderer = new THREE.CanvasRenderer();
        renderer.setSize( $('#gameWindow').width(), $('#gameWindow').height() );

        $('#gameWindow').append( renderer.domElement );
    };
    function updateScene() {

        var obj, i;
        for ( i = scene.children.length - 1; i >= 0 ; i -- ) {
            obj = scene.children[ i ];
            if (obj._isTile) {
                scene.remove(obj);
            }
        }

        _.each(Level.getTiles(), function(tile) {
            var t = tile;
            scene.add(t.mesh);
        });
        renderer.render(scene, camera.mesh);
    }

    var animate = function animate() {
        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( animate );

        var newTime = new Date().getTime();
        SkyRoads.delta = (newTime - currentTime) / 1000;
        currentTime = newTime;

        SkyRoads.time += SkyRoads.delta;
        if (SkyRoads.time > 2 && !SkyRoads.vehicle.dead) {
            keyboard.update();
            camera.update();
            vehicle.update();
        }
        renderer.render(scene, camera.mesh);
    };

    function getActiveTile()
    {
        if (!vehicle)
            return null;
        return Level.getTileAt(vehicle.mesh.position.x, vehicle.mesh.position.z);
    }

    $(function() {
        initScene();
        animate();

    });

    return {
        getActiveTile : getActiveTile,
        updateScene: updateScene
    };

})();