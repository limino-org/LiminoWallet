// Generate random colors
export const getRandomColor = () => {    
    // var r = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
    // var g = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
    // var b = Math.floor(Math.random() * (250 - 150 + 1)) + 150;
    // var color = '#'+r.toString(16)+g.toString(16)+b.toString(16);
    return `#${Math.floor(Math.random() * 0xffffff).toString(16)}`
 }


 


export interface IconData{
    list: Array<any>
    color: string
}

// Generating random SVG
export const getRandomIcon = () => {
    const list = []
    for(let i =0;i<3;i++){
        const x = ( Math.floor(Math.random() * (20 - -20 + 1)) + -20) + Math.random() 
        const y = ( Math.floor(Math.random() * (20 - -20 + 1)) + -20) + Math.random() 
        const a = ( Math.floor(Math.random() * (360 - 1 + 1)) + 360) + Math.random() 
        list.push({
            translate: {
                x,
                y
            },
            rotate: {
                a,
                b:16,
                c:16
            },
            fill: getRandomColor()
        })
    }
    return {
        fill: getRandomColor(),
        list
    }
}


//Generate globally unique identifiers
export function guid() {
    function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}