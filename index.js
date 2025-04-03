let canvas=document.querySelector("canvas")
const ctx = canvas.getContext("2d");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
let width=canvas.width;
let height=canvas.height;
let tankDragged=false;
let floor=height-25;
let mouseDown=false;
let tank={w:60,h:70,x:width/2,y:floor-73}
let cannon={w:100,h:30,angle:Math.PI/4,fire:false,rateOfFire:100}
let ballList=[]
let enemyList=[]
let dir={left:false,right:false,up:false,down:false}
let colorIndex=0
let prevTime=Date.now()
let score=0;
let highscore=localStorage.getItem('highscore'); 
if(highscore===null){
    highscore=0
}
canvas.addEventListener("mousedown",(e)=>{
    mouseDown=true;
    let path = new Path2D();
    path.rect(tank.x,tank.y,tank.w,tank.h)
    if ((ctx.isPointInPath(path, e.offsetX, e.offsetY))&&!tankDragged){
    tankDragged=true
    }
})
canvas.addEventListener("mouseup",()=>{
    mouseDown=false;
    tankDragged=false
})

canvas.addEventListener("mousemove",(e)=>{
if (tankDragged){
    tank.x=e.offsetX-tank.w/2;
}else if(mouseDown){
    cannon.angle=Math.atan2(tank.y-tank.h/2 - e.offsetY, (-(tank.x+tank.w/2 - e.offsetX)))
    if(cannon.angle>=Math.PI||(cannon.angle<0.1&&cannon.angle<-1)){
        cannon.angle=Math.PI-0.1
        }
    if(cannon.angle<0.1&&cannon.angle>-1){
    cannon.angle=0.1
    }
}
})
document.addEventListener("keydown",(key)=>{
   keyCheck(key,true)
})

document.addEventListener("keyup",(key)=>{
    keyCheck(key,false)
 })

function keyCheck(key,mode){
    if(!tankDragged){
        if(key.key=="a"){
            dir.left=mode
        }
        if(key.key=="d"){
            dir.right=mode
        }
    }
        if(key.key=="ArrowLeft"){
            dir.up=mode
        }
        if(key.key=="ArrowRight"){
            dir.down=mode;
        }
        if(key.key==" "||key.key=="ArrowDown"||key.key=="ArrowUp"){
            cannon.fire=mode;
        }
}
window.addEventListener("resize", () => {
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    width=canvas.width;
    height=canvas.height;
    floor=height-25;
    tank.y=floor-53
});
requestAnimationFrame(draw)

function draw(){
    setStatic()
    enemySpawn()
    ballList.forEach((ball,i)=>drawBall(ball,i))
    tankMovement()
    drawTank()
    enemyList.forEach((enemy,i)=>drawEnemy(enemy,i))
    drawScore(score,48,50)
    drawScore(highscore,32,80)
    requestAnimationFrame(draw)
}

function drawScore(score,size,y){
    ctx.font = `${size}px sans-serif`;
    let string=score.toString()
    let stringLength=string.length
    for(i=0;i<7-stringLength;i++){
        string="0"+string
    }
    ctx.fillText(string, width/2-(ctx.measureText(string).width/2), y);
}

function setStatic(){
    //sky
    ctx.fillStyle="#130d36"
    ctx.fillRect(0,0,width,height)
    //floor
    ctx.fillStyle="#11360d"
    ctx.fillRect(0,floor,width,height)
    ctx.beginPath()
    ctx.moveTo(0,floor,0,0)
    ctx.lineTo(width,floor,width,height)
    ctx.closePath()
    ctx.stroke()
    }
    
    function enemySpawn(){
        if(enemy.count<5){
            let angle
            if(Math.random()<0.5){
                angle=-Math.PI/4
        }else{
            angle=-2.35619
        }
            enemyList.push(new enemy(60,angle,Math.floor(Math.random() * ((width-60) - (60) + 1) + (60)),0))
            enemy.count++
        }
    }
function tankMovement(){
    if(dir.right){
        tank.x+=10
    }
    if(dir.left){
        tank.x-=10
    }
    if(tank.x>width-tank.w){
        tank.x=width-tank.w;
    }
    if(tank.x<0){
        tank.x=0;
    }
    if(dir.up&&cannon.angle<Math.PI-0.1){
        cannon.angle+=0.1
    }
    if(dir.down&&cannon.angle>0.1){
        cannon.angle-=0.1
    }
    if(cannon.fire&&Date.now()-prevTime>cannon.rateOfFire){
        prevTime=Date.now()
        ballList.push(new ball(colorIndex))
        colorIndex++
        colorIndex=colorIndex%5
    }
}
class ball {
        constructor(i){
            this.color=60*i
        }
        angle=cannon.angle
        xStart=tank.x+tank.w/2+(cannon.w-25)*Math.cos(this.angle)
        yStart=tank.y+tank.h/2-tank.h/4+4+(cannon.w-25)*Math.sin(-this.angle)
        x=this.xStart
        y=this.yStart
        vi=25 //INITIAL VELOCITY
        bounce=0
        vel={x:(this.vi)*Math.cos(this.angle),y:(-this.vi*Math.sin(this.angle))}
        finish=false
    physics(){
        this.x+=this.vel.x
        this.vel.y+=this.vi/height*20 //GRAVITY
        this.y+=this.vel.y
        if(this.y>floor){
            this.bounce++
            this.y=floor-1
            this.vel.y=(-this.vi*Math.sin(this.angle))/Math.sqrt(this.bounce)
            this.vel.x=(this.vi-(10*Math.sqrt(this.bounce)))*Math.cos(this.angle)
        }
        if(this.vi-(10*Math.sqrt(this.bounce))<0){
            this.vel.x=0
        }
        if(((this.vi/this.bounce<2)&&this.y==floor-1)||this.x<0||this.x>width){
            this.finish=true
        }
    }
  }

  class enemy{
    static count=0
    constructor(size,angle,xStart,yStart){
        this.size=size
        this.angle=angle
        this.vi=5 //INITIAL VELOCITY
        this.vel={x:(this.vi)*Math.cos(this.angle),y:(-this.vi*Math.sin(this.angle))}
        this.xStart=xStart
        this.yStart=yStart
        this.x=this.xStart
         this.y=this.yStart
    }
    bounce=1
    finish=false
    physics(i){
        this.x+=this.vel.x
        this.vel.y+=this.vi/height*20 //GRAVITY
        this.y+=this.vel.y
        if(this.x<0+this.size||this.x>width-this.size){
            this.vel.x=this.vel.x*-1
        }
        if(this.y>floor-this.size){
            if(Math.random()<0.5){
                this.angle=-2.35619
            }else{
                this.angle=-Math.PI/4
            }
            this.y=floor-this.size
            this.vel.y=(-this.vi*Math.sin(-this.angle))*3
            this.vel.x=(this.vi)*Math.cos(-this.angle)
        }
  }
}

function drawBall(ball,i){
    ctx.beginPath();
    ctx.fillStyle=`oklch(100% 0.9 ${ball.color}deg)`
    if(!ball.finish){
        ball.physics()
    }else{
        ballList.splice(i,1)
    }
    ctx.arc(ball.x,ball.y,10,0,2*Math.PI)
    ctx.fill()
    ctx.stroke()
}

function drawTank(){
    //cannon
    ctx.fillStyle="#b8b8b8"
    ctx.translate(tank.x+tank.w/2,tank.y+tank.h/2-tank.h/4+4)
    ctx.rotate(-cannon.angle);
    ctx.beginPath();
    ctx.roundRect(-cannon.w/4+cannon.w/8, -cannon.h/2, cannon.w, cannon.h,[5])
    ctx.fill()
    ctx.stroke()
    ctx.translate(-tank.x+tank.w/2, -tank.y+tank.h/2-tank.h/4+4)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    //body
    let pathTank=new Path2D()
    ctx.fillStyle="#b8b8b8"
    ctx.beginPath();
    ctx.roundRect(tank.x,tank.y,tank.w,tank.h,[10])
    pathTank.roundRect(tank.x,tank.y,tank.w,tank.h,[10])
    ctx.fill()
    ctx.stroke()
enemyList.forEach((enemy)=>{
    checkPath(pathTank,enemy)
})
    //wheels
    ctx.beginPath();
    ctx.fillStyle="black"
    ctx.arc(tank.x+10,tank.y+70,10,0,2*Math.PI)
    ctx.arc(tank.x+50,tank.y+70,10,0,2*Math.PI)
    ctx.fill()
    //rect on front
    ctx.fillStyle=`oklch(100% 0.9 ${60*colorIndex}deg)`
    ctx.lineWidth=2
    ctx.beginPath();
    ctx.roundRect(tank.x+5,tank.y+25,50,10,[40])
    ctx.fill()
    ctx.stroke()
}

function checkPath(path,enem){
    if(enem.y+enem.size>tank.h+cannon.h){
    if(
    ctx.isPointInPath(path,enem.x,enem.y)||
    ctx.isPointInPath(path,enem.x+enem.size,enem.y)||
    ctx.isPointInPath(path,enem.x-enem.size,enem.y)||
    ctx.isPointInPath(path,enem.x,enem.y+enem.size)||
    ctx.isPointInPath(path,enem.x,enem.y-enem.size)){
        score=0
       enemyList=[]
       ballList=[]
       enemy.count=0
        tank.x=width/2
        return;
    }
}
}

function drawEnemy(enem,i){    
    let findHit=false
    ctx.fillStyle="white"
    ctx.beginPath();
    ctx.arc(enem.x,enem.y,enem.size,0,2*Math.PI)
    enem.physics(i)
    ballList.forEach((ball)=>{
        if(ctx.isPointInPath(ball.x,ball.y)&&!findHit){
            findHit=true
            if(enem.size>15){
                enemyList.push(new enemy(enem.size/2,2.35619,enem.x+25,enem.y))
                enemyList.push(new enemy(enem.size/2,Math.PI/4,enem.x-25,enem.y))
            }
            if(enem.size==60){
                enemy.count--
            }
            enemyList.splice(i,1)
            score++
            if(score>highscore){
                highscore=score
                localStorage.setItem('highscore',highscore.toString()); 
            }
            return;
        }
    })
    ctx.fill()
    ctx.stroke()
}
