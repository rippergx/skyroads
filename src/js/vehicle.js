var Vehicle = (function (scene) {
	var mesh;

	function init() {
		var jsonLoader = new THREE.JSONLoader();
		jsonLoader.load( "/js/models/spaceship.js", function( geometry ) { createScene( geometry ) } );

		dead = false;
	}


	function createScene( geometry ) {
		var m = new THREE.MeshLambertMaterial( { color: 0x999fff } );
		mesh = new THREE.Mesh( geometry, m );

		spawn();
		update();
	}


	function updateState() {
		if (!SkyRoads.vehicle.dead && !SkyRoads.vehicle.winning) {
			_handleArrowKeys();
		
			_handleCollisions();

			_handleGravity();		

			_handleTile();

			_moveUpAndSideways();

			_handleFallingOfTheGrid();

		}
		_moveForward();
	}

	function _moveForward() {
		SkyRoads.vehicle.position.z -= SkyRoads.vehicle.velocity.z * SkyRoads.delta;
	}

	function _moveUpAndSideways() {
		SkyRoads.vehicle.position.x += SkyRoads.vehicle.velocity.x * SkyRoads.delta;
		SkyRoads.vehicle.position.y += SkyRoads.vehicle.velocity.y * SkyRoads.delta;
	}

	function _handleFallingOfTheGrid() {
		// detect death by falling
		if (SkyRoads.vehicle.position.y < -SkyRoads.world.killDepth) {
			Scene.killVehicle();
		}
	}

	function _handleTile() {
		// Handle special tile properties
		var tile = Level.getTileAt(mesh.position.x, mesh.position.z);
		if (!tile) 
			return;
		// 1. Booster tile
		if (tile.cell.type === "booster") {
			SkyRoads.vehicle.velocity.z += SkyRoads.world.boostAcceleration * SkyRoads.delta;
			SkyRoads.vehicle.velocity.z = Math.min(SkyRoads.vehicle.velocity.z, SkyRoads.vehicle.maximumVelocity.z);
		}
		else if (tile.cell.type === "explosive" && SkyRoads.vehicle.position.y >= tile.cell.h && SkyRoads.vehicle.position.y <= (tile.cell.h + 20)) {
			Scene.killVehicle();
		}
		else if (tile && tile.cell && tile.cell.type === "end") {
			Scene.winLevel();
		}
	}

	function _handleGravity() {
		// falling
		SkyRoads.vehicle.velocity.y -= SkyRoads.world.gravity * SkyRoads.delta;
		
		_handleJump();	
		
		_handleFloorCollision();	
	}

	function _handleFloorCollision() {
		if (!isCollidingWithFloor()) 
			return;

		var tileHeight = getMinHeight();
		SkyRoads.vehicle.position.y = Math.max(tileHeight, SkyRoads.vehicle.position.y / 2);
		if (!SkyRoads.vehicle.velocity.bounceY)
			SkyRoads.vehicle.velocity.bounceY = SkyRoads.vehicle.maximumVelocity.y;

		var bounce = Math.max(0, SkyRoads.vehicle.velocity.bounceY / 2);
		SkyRoads.vehicle.velocity.y = bounce;
		SkyRoads.vehicle.velocity.bounceY = bounce;
	}

	function _handleJump() {
		if (!SkyRoads.keyboard.spacebar)
			return;

		var bounceY = SkyRoads.vehicle.velocity.bounceY;
		var maximumVelocityY = SkyRoads.vehicle.maximumVelocity.y;

		if (isCollidingWithFloor() || bounceY <= maximumVelocityY / 2) 
		{
			SkyRoads.vehicle.velocity.bounceY = maximumVelocityY; 
			SkyRoads.vehicle.velocity.y = maximumVelocityY;
		}	
	}

	function _handleCollisions() {
		// collision detection
		// We could be exploding
		if ( hasFrontalCollisions() ) {
			if ( SkyRoads.vehicle.velocity.z > 500 ) {
				Scene.killVehicle();
			}
			else {
				SkyRoads.vehicle.velocity.z = 0;
			}
		}
		// Or pushing up against the side of a block
		else if (hasLateralCollisions()) {
			SkyRoads.vehicle.velocity.x = 0;
		}

	}

	function _handleArrowKeys() {
		if (SkyRoads.keyboard.keyUp) {
			SkyRoads.vehicle.velocity.z += SkyRoads.vehicle.acceleration * SkyRoads.delta;
		}
		if (SkyRoads.keyboard.keyDown) {
			SkyRoads.vehicle.velocity.z -= SkyRoads.vehicle.deceleration * SkyRoads.delta;
		}
		SkyRoads.vehicle.velocity.z = Math.min(SkyRoads.vehicle.velocity.z, SkyRoads.vehicle.maximumVelocity.z);
		SkyRoads.vehicle.velocity.z = Math.max(0, SkyRoads.vehicle.velocity.z);

		// left / right
		SkyRoads.vehicle.velocity.x = 0;
		if (SkyRoads.keyboard.keyLeft) {
			SkyRoads.vehicle.velocity.x -= SkyRoads.vehicle.maximumVelocity.x;
		}
		if (SkyRoads.keyboard.keyRight) {
			SkyRoads.vehicle.velocity.x += SkyRoads.vehicle.maximumVelocity.x;
		}

		SkyRoads.vehicle.velocity.x = Math.min(SkyRoads.vehicle.velocity.x, SkyRoads.vehicle.maximumVelocity.x);
		SkyRoads.vehicle.velocity.x = Math.max(SkyRoads.vehicle.velocity.x, -SkyRoads.vehicle.maximumVelocity.x);



	}

	function getMinHeight() {
		var pos = SkyRoads.vehicle.position;
		var boxRadiusX = SkyRoads.vehicle.size.x / 2;
		var boxRadiusY = SkyRoads.vehicle.size.y / 2;
		var boxRadiusZ = SkyRoads.vehicle.size.z / 2;

		var cornerTiles = [];
		cornerTiles.push(Level.getTileAt(pos.x - boxRadiusX, pos.z - boxRadiusZ));
		cornerTiles.push(Level.getTileAt(pos.x - boxRadiusX, pos.z + boxRadiusZ));
		cornerTiles.push(Level.getTileAt(pos.x + boxRadiusX, pos.z - boxRadiusZ));
		cornerTiles.push(Level.getTileAt(pos.x + boxRadiusX, pos.z + boxRadiusZ));

		var minHeight = -100000;
		_.each(cornerTiles, function(tile) {
			if (tile !== undefined) {
				minHeight = Math.max(minHeight, tile.cell.h);
			}
		});
		return minHeight + boxRadiusY + 1;
	}

	function move() {
		if (!SkyRoads.vehicle.winning) {
			mesh.position.x = SkyRoads.vehicle.position.x;
			mesh.position.y = SkyRoads.vehicle.position.y;
			mesh.position.z = SkyRoads.vehicle.position.z;
		}
		editor.updateEditorWindow(mesh.position);

		mesh.rotation.x = SkyRoads.vehicle.rotation.x;
		mesh.rotation.y = SkyRoads.vehicle.rotation.y;
		mesh.rotation.z = SkyRoads.vehicle.rotation.z;


	}

	function scale() {
		mesh.scale.x = SkyRoads.vehicle.size.x;
		mesh.scale.y = SkyRoads.vehicle.size.y;
		mesh.scale.z = SkyRoads.vehicle.size.z;
	}

	function hasLateralCollisions() {
		var boxRadiusX = SkyRoads.vehicle.size.x / 2;
		var directionVector = new THREE.Vector3(SkyRoads.vehicle.velocity.x, 0, 0);
		return hasCollisions(directionVector, boxRadiusX);
	}

	function hasFrontalCollisions() {
		var boxRadiusZ = SkyRoads.vehicle.size.z / 2;
		var directionVector = new THREE.Vector3(0, 0, -SkyRoads.vehicle.velocity.z);
		return hasCollisions(directionVector, boxRadiusZ);
	}

	function isCollidingWithFloor() {
		var directionVector = new THREE.Vector3(0, SkyRoads.vehicle.velocity.y, 0);
		return hasCollisions(directionVector, 0);
	}

	function hasCollisions(directionVector, boxRadius) {
		if (!mesh)
			return;

		var meshes = Level.getMeshes(getActiveTile());
		if (!meshes || !meshes.length)
			return;

		var originPoint = mesh.position.clone();
		originPoint = originPoint.subSelf(new THREE.Vector3(0, SkyRoads.vehicle.size.y / 2, 0));

		var ray = new THREE.Ray(originPoint, directionVector.clone().normalize());
		var collisionResults = ray.intersectObjects(meshes);
		if (collisionResults.length > 0 && (collisionResults[0].distance - boxRadius) < directionVector.length() * SkyRoads.delta) {
			return true;
		}
		return false;
	}

	function update() {
		if (!mesh) {
			return;
		}

		updateState();
		move();
		scale();
	}

	init();

	function spawn() {
		scene.add(mesh);
	}

	function destroy() {
		scene.remove(mesh);
	}

	function getActiveTile()
	{
		if (!mesh) {
			return null;
		}
		return Level.getTileAt(mesh.position.x, mesh.position.z);
	}

	return {
		update: update,
			move: move,
			spawn: spawn,
			destroy: destroy,
			getActiveTile: getActiveTile,
			getMinHeight: getMinHeight
	};
});
