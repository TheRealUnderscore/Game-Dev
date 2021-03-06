var animationStates = {};

// CREATE SCENE
var delayCreateScene = function() { // Comments: ( \/\*|\*\/ )
    
    engine.enableOfflineSupport = false;
    
    // This is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
    BABYLON.Animation.AllowMatricesInterpolation = true;

    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics();

    var music = new BABYLON.Sound("Background", "/sounds/music/background.mp3", scene, null, { loop: true, autoplay: true });

	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.6;
	light.specular = BABYLON.Color3.Black();

    var light2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
    light2.position = new BABYLON.Vector3(0, 5, 5);

    // Shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
	
    engine.displayLoadingUI();

	BABYLON.SceneLoader.ImportMesh("", "./scenes/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons) {
        var skeleton = skeletons[0];

        var camera = new BABYLON.ArcRotateCamera(
            "arcCamera", 
            BABYLON.Tools.ToRadians(45), 
            BABYLON.Tools.ToRadians(45), 
            7.5,
            skeleton.position, 
            scene
        ); 
        camera.attachControl(canvas, true);

        camera.keysUp.push(72); 
        camera.keysDown.push(80); 
        camera.keysLeft.push(75); 
        camera.keysRight.push(77);

        shadowGenerator.addShadowCaster(scene.meshes[0], true);
        for(var index = 0; index < newMeshes.length; index++) {
            newMeshes[index].receiveShadows = false;;
        }

        var helper = scene.createDefaultEnvironment({
            enableGroundShadow: true
        });
        helper.setMainColor(BABYLON.Color3.Gray());
        helper.ground.position.y += 0.01;

        // ROBOT
        skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        skeleton.animationPropertiesOverride.enableBlending = true;
        skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
        skeleton.animationPropertiesOverride.loopMode = 1;
    
        var idleRange = skeleton.getAnimationRange("YBot_Idle");
        var walkRange = skeleton.getAnimationRange("YBot_Walk");
        var runRange = skeleton.getAnimationRange("YBot_Run");
        var leftRange = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
        var rightRange = skeleton.getAnimationRange("YBot_RightStrafeWalk");
        
        // IDLE
        if(idleRange) { scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true); }
		       
        // UI
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var UiPanel = new BABYLON.GUI.StackPanel();
        UiPanel.width = "220px";
        UiPanel.fontSize = "14px";
        UiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        UiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(UiPanel);
        // ..
        var button = BABYLON.GUI.Button.CreateSimpleButton("but1", "Play Idle");
        button.paddingTop = "10px";
        button.width = "100px";
        button.height = "50px";
        button.color = "white";
        button.background = "green";
        button.onPointerDownObservable.add(()=> {
            if(idleRange) { scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true); }
        });
        //UiPanel.addControl(button);
        // ..
        var button1 = BABYLON.GUI.Button.CreateSimpleButton("but2", "Play Walk");
        button1.paddingTop = "10px";
        button1.width = "100px";
        button1.height = "50px";
        button1.color = "white";
        button1.background = "green";
        button1.onPointerDownObservable.add(()=> {
            if(walkRange) { scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true); }
        });
        //UiPanel.addControl(button1);
        // ..
        var button1 = BABYLON.GUI.Button.CreateSimpleButton("but3", "Play Run");
        button1.paddingTop = "10px";
        button1.width = "100px";
        button1.height = "50px";
        button1.color = "white";
        button1.background = "green";
        button1.onPointerDownObservable.add(()=> {
            if(runRange) { scene.beginAnimation(skeleton, runRange.from, runRange.to, true); }
        });
        //UiPanel.addControl(button1);
        // ..
        var button1 = BABYLON.GUI.Button.CreateSimpleButton("but4", "Play Left");
        button1.paddingTop = "10px";
        button1.width = "100px";
        button1.height = "50px";
        button1.color = "white";
        button1.background = "green";
        button1.onPointerDownObservable.add(()=> {
            if(leftRange) { scene.beginAnimation(skeleton, leftRange.from, leftRange.to, true); }
        });
        //UiPanel.addControl(button1);
        // ..
        var button1 = BABYLON.GUI.Button.CreateSimpleButton("but5", "Play Right");
        button1.paddingTop = "10px";
        button1.width = "100px";
        button1.height = "50px";
        button1.color = "white";
        button1.background = "green";
        button1.onPointerDownObservable.add(()=> {
            if(rightRange) { scene.beginAnimation(skeleton, rightRange.from, rightRange.to, true); }
        });
        //UiPanel.addControl(button1);
        // ..
        var button1 = BABYLON.GUI.Button.CreateSimpleButton("but6", "Play Blend");
        button1.paddingTop = "10px";
        button1.width = "100px";
        button1.height = "50px";
        button1.color = "white";
        button1.background = "green";
        button1.onPointerDownObservable.add(()=> {
            if(walkRange && leftRange) {
                scene.stopAnimation(skeleton);
                var walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 0.5, true);
                var leftAnim = scene.beginWeightedAnimation(skeleton, leftRange.from, leftRange.to, 0.5, true);

                // Sync Speed Ratio With Master Walk Animation
                walkAnim.syncWith(null);
                leftAnim.syncWith(walkAnim);
            }
        });
        //UiPanel.addControl(button1); 

        engine.hideLoadingUI();

        // KEYBOARD PRESS EVENTS
        scene.onKeyboardObservable.add(function(kbInfo) {
            var info = JSON.stringify(kbInfo.type, null, 4);
            var key = kbInfo.event.key.toLowerCase();
            var event = JSON.stringify(kbInfo.type);
            //alert(key);

            var validKeysObj = {
                "w": "w",
                "a": "a",
                "s": "s",
                "d": "d"
            };
            var validKeys = Object.keys(validKeysObj);

            if(event === "1") {
                var animationState = animationStates[key];
                animationStates[key] = true;

                if(!animationState) {
                    setAnimation(skeleton, true);
                }
            }
            else {
                delete animationStates[key];

                if(JSON.stringify(animationStates) === "{}") {
                    scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true);
                }
                else {
                    if(validKeys.includes(key)) { setAnimation(skeleton); }
                }
            }

            function setAnimation(skeleton, state = null) {
                console.log(
                    key,
                    (!(key in validKeys)),
                    key !== "shift",
                    (!(key in validKeys)) && key !== "shift"
                );
                if((!(key in validKeys)) && key !== "shift") {
                    //return;
                }
                var keys = Object.keys(animationStates).filter(result => result in validKeys);

                var blend = (
                    (animationStates["w"] && animationStates["a"]) ||
                    (animationStates["w"] && animationStates["d"]) ||
                    (animationStates["s"] && animationStates["a"]) ||
                    (animationStates["s"] && animationStates["d"])
                ) ? 0.5 : 1;
                //console.log(blend);
                //console.log(keys, keys.length, blend);

                //var currentFrame = Math.round(animatable.getAnimations()[0].currentFrame);
                //console.log(currentFrame, walkRange.from, walkRange.to, runRange.from);

                var animation1;
                var animation2;
                var isStopped;

                if(animationStates["w"]) {
                    //console.log("KEY W: ", key);

                    isStopped = true;
                    scene.stopAnimation(skeleton);

                    if(animationStates["shift"]) {
                        animation1 = scene.beginWeightedAnimation(skeleton, runRange.from, runRange.to, blend, true);
                    }
                    else {
                        animation1 = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, blend, true);
                    }
                }

                else if(animationStates["s"]) {
                    isStopped = true;
                    scene.stopAnimation(skeleton);
                    //animation1 = scene.beginWeightedAnimation(skeleton, backRange.from, backRange.to, blend, true);
                }

                if(animationStates["a"]) {
                    if(!isStopped) {
                        scene.stopAnimation(skeleton);
                    }
                    animation2 = scene.beginWeightedAnimation(skeleton, leftRange.from, leftRange.to, blend, true);
                }

                else if(animationStates["d"]) {
                    if(!isStopped) {
                        scene.stopAnimation(skeleton);
                    }
                    animation2 = scene.beginWeightedAnimation(skeleton, rightRange.from, rightRange.to, blend, true);
                }

                if(blend === 0.5) {
                    animation1.syncWith(null);
                    animation2.syncWith(animation1);
                }
            }
        });
    });	

    return scene;
};