
Sky = function () {
    this.mesh = new THREE.Object3D();
    this.nClouds = 20;
    this.clouds = [];
    var stepAngle = Math.PI * 2 / this.nClouds;
    for (var i = 0; i < this.nClouds; i++) {
        var c = new Cloud();
        this.clouds.push(c);
        var a = stepAngle * i;
        var h = game.seaRadius + 150 + Math.random() * 200;
        c.mesh.position.y = Math.sin(a) * h;
        c.mesh.position.x = Math.cos(a) * h;
        c.mesh.position.z = -300 - Math.random() * 500;
        c.mesh.rotation.z = a + Math.PI / 2;
        var s = 1 + Math.random() * 2;
        c.mesh.scale.set(s, s, s);
        this.mesh.add(c.mesh);
    }
}

Sky.prototype.moveClouds = function () {
    for (var i = 0; i < this.nClouds; i++) {
        var c = this.clouds[i];
        c.rotate();
    }
    this.mesh.rotation.z += game.speed * deltaTime;

}


Cloud = function () {
    this.mesh = new THREE.Object3D();
    this.mesh.name = "cloud";
    var geom = new THREE.CubeGeometry(20, 20, 20);
    var mat = new THREE.MeshPhongMaterial({
        color: Colors.white,

    });

    //*
    var nBlocs = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < nBlocs; i++) {
        var m = new THREE.Mesh(geom.clone(), mat);
        m.position.x = i * 15;
        m.position.y = Math.random() * 10;
        m.position.z = Math.random() * 10;
        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;
        var s = .1 + Math.random() * .9;
        m.scale.set(s, s, s);
        this.mesh.add(m);
        m.castShadow = true;
        m.receiveShadow = true;

    }
    //*/
}

Cloud.prototype.rotate = function () {
    var l = this.mesh.children.length;
    for (var i = 0; i < l; i++) {
        var m = this.mesh.children[i];
        m.rotation.z += Math.random() * .005 * (i + 1);
        m.rotation.y += Math.random() * .002 * (i + 1);
    }
}