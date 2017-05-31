let fse = require('fs-extra');

let data = fse.readFileSync('./sss_data.txt');

let _data = data.toString();
let rows = _data.split('\n');
let dataSSS = [];
rows.forEach(v => {
  if (v.substr(0, 2) === '*|') {
    // *| 0 A S 600000686, 18532, ( 0.7538)  0.7538, Y, ทรงศักดิ์ เนื่องมหา
    let a = v.split(',');
    let pcode;
    let tcode;
    let iptype;
    let an;
    let is_sss = a[3];
    let name = a[4];

    let b = a[0].split(' ');
    pcode = b[1];
    tcode = b[2];
    iptype = b[3];
    an = b[4];
    // RW, DRG, ADJRW
    let c = a[2].split(' ');
    let adjrw = c[c.length - 1];

    let obj = {
      pcode: pcode,
      tcode: tcode,
      iptype: iptype,
      an: an,
      adjrw: adjrw,
      is_sss: is_sss,
      an: an
    }
    dataSSS.push(obj);
  }
});

console.log(dataSSS);