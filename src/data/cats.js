export const shopsList = [
  'Alza.cz','CZC.cz','Mironet.cz','Mall.cz','Datart.cz',
  'Alza.sk','Nay.sk','iMobility.sk','T.cz','Czshop.cz','Planeo.cz','Okay.cz',
]

export const shopUrls = {
  Alza:    name => `https://www.alza.cz/search.htm?exps=${encodeURIComponent(name)}`,
  CZC:     name => `https://www.czc.cz/hledat?q=${encodeURIComponent(name)}`,
  Mironet: name => `https://www.mironet.cz/vyhledavani/?search=${encodeURIComponent(name)}`,
  Mall:    name => `https://www.mall.cz/search?phrase=${encodeURIComponent(name)}`,
  Datart:  name => `https://www.datart.cz/vyhledavani.html?q=${encodeURIComponent(name)}`,
}

export const cats = {
  cpu: { icon:'🧠', name:'Procesor (CPU)', filters:['Vše','AMD','Intel'], filterKey:'brand', items:[
    { id:'r5-5600',   name:'AMD Ryzen 5 5600',       specs:'6C/12T · 3.5GHz · AM4',              price:3490,  brand:'AMD',    rating:82, top:true,
      shops:{Alza:3590,CZC:3490,Mironet:3550,Mall:3680},
      params:{cores:6,threads:12,freq:3.5,boost:4.4,tdp:65,socket:'AM4',cache:32,score:82}},
    { id:'r7-7700',   name:'AMD Ryzen 7 7700',       specs:'8C/16T · 3.8GHz · AM5',              price:6990,  brand:'AMD',    rating:88,
      shops:{Alza:7190,CZC:6990,Mironet:7050},
      params:{cores:8,threads:16,freq:3.8,boost:5.3,tdp:65,socket:'AM5',cache:40,score:88}},
    { id:'i5-13600k', name:'Intel Core i5-13600K',   specs:'14C/20T · 3.5GHz · LGA1700',         price:7290,  brand:'Intel',  rating:90,
      shops:{Alza:7490,CZC:7290,Datart:7590},
      params:{cores:14,threads:20,freq:3.5,boost:5.1,tdp:125,socket:'LGA1700',cache:24,score:90}},
    { id:'r9-7950x',  name:'AMD Ryzen 9 7950X',      specs:'16C/32T · 4.5GHz · AM5',             price:16990, brand:'AMD',    rating:98,
      shops:{Alza:17200,CZC:16990},
      params:{cores:16,threads:32,freq:4.5,boost:5.7,tdp:170,socket:'AM5',cache:80,score:98}},
  ]},
  gpu: { icon:'🎮', name:'Grafická karta (GPU)', filters:['Vše','NVIDIA','AMD'], filterKey:'brand', items:[
    { id:'rx6600',  name:'AMD RX 6600 8GB',        specs:'RDNA2 · 8GB GDDR6 · 132W',          price:5990,  brand:'AMD',    rating:75,
      shops:{Alza:6190,CZC:5990,Mironet:6090},
      params:{vram:8,bus:128,tdp:132,shader:1792,freq:2491,score:75}},
    { id:'rtx4060', name:'NVIDIA RTX 4060 8GB',    specs:'Ada Lovelace · DLSS3',              price:9490,  brand:'NVIDIA', rating:82, top:true,
      shops:{Alza:9690,CZC:9490,Mall:9799},
      params:{vram:8,bus:128,tdp:115,shader:3072,freq:2460,score:82}},
    { id:'rtx4070', name:'NVIDIA RTX 4070 12GB',   specs:'Ada Lovelace · 12GB · DLSS3',       price:15990, brand:'NVIDIA', rating:92,
      shops:{Alza:16200,CZC:15990,Mironet:16100},
      params:{vram:12,bus:192,tdp:200,shader:5888,freq:2475,score:92}},
    { id:'rtx4090', name:'NVIDIA RTX 4090 24GB',   specs:'Ada Lovelace · 24GB · Flagship',    price:42990, brand:'NVIDIA', rating:99,
      shops:{Alza:43500,CZC:42990},
      params:{vram:24,bus:384,tdp:450,shader:16384,freq:2520,score:99}},
  ]},
  ram: { icon:'💾', name:'Operační paměť (RAM)', filters:['Vše','DDR4','DDR5'], filterKey:'type', items:[
    { id:'ram16',     name:'Kingston FURY 16GB DDR4',    specs:'2×8GB · 3200MHz · CL16',   price:1190, type:'DDR4', rating:70,
      shops:{Alza:1290,CZC:1190,Mironet:1250},
      params:{capacity:16,freq:3200,cl:16,channels:2,gen:'DDR4',score:70}},
    { id:'ram32',     name:'Corsair Vengeance 32GB DDR4',specs:'2×16GB · 3600MHz · CL18',  price:2290, type:'DDR4', rating:82, top:true,
      shops:{Alza:2490,CZC:2290},
      params:{capacity:32,freq:3600,cl:18,channels:2,gen:'DDR4',score:82}},
    { id:'ram32ddr5', name:'G.Skill Trident 32GB DDR5',  specs:'2×16GB · 6000MHz · CL36',  price:4490, type:'DDR5', rating:95,
      shops:{Alza:4690,CZC:4490,Mall:4799},
      params:{capacity:32,freq:6000,cl:36,channels:2,gen:'DDR5',score:95}},
  ]},
  mb: { icon:'🔌', name:'Základní deska', filters:['Vše','AM4','AM5','LGA1700'], filterKey:'socket', items:[
    { id:'b550', name:'ASUS PRIME B550M-A',           specs:'AM4 · mATX · DDR4',                price:2590, socket:'AM4',     rating:72,
      shops:{Alza:2790,CZC:2590,Mironet:2650},
      params:{socket:'AM4',formfactor:'mATX',ddr:'DDR4',pcie:'PCIe 4.0',usb:'USB 3.2',wifi:false,score:72}},
    { id:'b650', name:'MSI MAG B650 TOMAHAWK',        specs:'AM5 · ATX · DDR5 · WiFi6E',       price:5990, socket:'AM5',     rating:88, top:true,
      shops:{Alza:6200,CZC:5990},
      params:{socket:'AM5',formfactor:'ATX',ddr:'DDR5',pcie:'PCIe 5.0',usb:'USB 3.2 Gen2',wifi:true,score:88}},
    { id:'z790', name:'GIGABYTE Z790 AORUS ELITE',    specs:'LGA1700 · ATX · DDR5 · PCIe5',    price:8990, socket:'LGA1700', rating:94,
      shops:{Alza:9200,CZC:8990,Mironet:9100},
      params:{socket:'LGA1700',formfactor:'ATX',ddr:'DDR5',pcie:'PCIe 5.0',usb:'USB 3.2 Gen2x2',wifi:true,score:94}},
  ]},
  ssd: { icon:'💿', name:'Úložiště (SSD)', filters:['Vše','SATA','NVMe'], filterKey:'type', items:[
    { id:'ssd500',  name:'Samsung 870 EVO 500GB',  specs:'SATA · 560MB/s',             price:1190, type:'SATA',  rating:65,
      shops:{Alza:1290,CZC:1190},
      params:{capacity:500,read:560,write:530,iface:'SATA',tbw:300,score:65}},
    { id:'nvme1t',  name:'Samsung 980 Pro 1TB',    specs:'NVMe PCIe4 · 7000MB/s · M.2',price:2590, type:'NVMe',  rating:90, top:true,
      shops:{Alza:2790,CZC:2590,Mironet:2650},
      params:{capacity:1000,read:7000,write:5000,iface:'NVMe PCIe4',tbw:600,score:90}},
    { id:'nvme2t',  name:'WD Black SN850X 2TB',    specs:'NVMe PCIe4 · 7300MB/s · M.2',price:4290, type:'NVMe',  rating:95,
      shops:{Alza:4490,CZC:4290},
      params:{capacity:2000,read:7300,write:6600,iface:'NVMe PCIe4',tbw:1200,score:95}},
  ]},
  psu: { icon:'⚡', name:'Zdroj (PSU)', filters:['Vše','550W','750W','1000W'], filterKey:'watt', items:[
    { id:'psu550',  name:'Be Quiet! Pure Power 550W', specs:'80+ Bronze · Semi-Modular',    price:1490, watt:'550W',  rating:72,
      shops:{Alza:1590,CZC:1490,Mironet:1550},
      params:{wattage:550,efficiency:'80+ Bronze',modular:'Semi',score:72}},
    { id:'psu750',  name:'Corsair RM750x 750W',       specs:'80+ Gold · Fully Modular',     price:2690, watt:'750W',  rating:88, top:true,
      shops:{Alza:2890,CZC:2690},
      params:{wattage:750,efficiency:'80+ Gold',modular:'Full',score:88}},
    { id:'psu1000', name:'EVGA SuperNOVA 1000W',      specs:'80+ Platinum · Fully Modular', price:4990, watt:'1000W', rating:95,
      shops:{Alza:5190,CZC:4990,Mall:5299},
      params:{wattage:1000,efficiency:'80+ Platinum',modular:'Full',score:95}},
  ]},
  case: { icon:'🖥️', name:'Skříň', filters:['Vše','Mid Tower','Full Tower'], filterKey:'size', items:[
    { id:'h510',  name:'NZXT H510 Compact',          specs:'ATX Mid Tower · Tempered Glass', price:2290, size:'Mid Tower',  rating:78,
      shops:{Alza:2490,CZC:2290,Mironet:2350},
      params:{size:'Mid Tower',fans:2,radiator:240,score:78}},
    { id:'o11',   name:'Lian Li PC-O11 Dynamic',     specs:'ATX Full Tower · Dual Chamber',  price:3490, size:'Full Tower', rating:92, top:true,
      shops:{Alza:3690,CZC:3490},
      params:{size:'Full Tower',fans:3,radiator:360,score:92}},
    { id:'mesh2', name:'Fractal Design Meshify 2',   specs:'ATX Mid Tower · Mesh Front',     price:3990, size:'Mid Tower',  rating:94,
      shops:{Alza:4190,CZC:3990,Mall:4299},
      params:{size:'Mid Tower',fans:3,radiator:360,score:94}},
  ]},
  cool: { icon:'❄️', name:'Chlazení CPU', filters:['Vše','Air','Liquid'], filterKey:'type', items:[
    { id:'box',    name:'AMD Wraith Stealth (box)', specs:'Air · AM4/AM5 · Tichý',       price:0,    type:'Air',    rating:45,
      shops:{},
      params:{type:'Air',tdp:65,fans:1,noise:35,score:45}},
    { id:'ak620',  name:'DeepCool AK620',           specs:'Air · Dual Tower · 260W TDP', price:1590, type:'Air',    rating:88, top:true,
      shops:{Alza:1690,CZC:1590,Mironet:1650},
      params:{type:'Air',tdp:260,fans:2,noise:28,score:88}},
    { id:'kraken', name:'NZXT Kraken 240 AIO',      specs:'Liquid · 240mm · RGB',        price:3290, type:'Liquid', rating:92,
      shops:{Alza:3490,CZC:3290,Mall:3599},
      params:{type:'Liquid',tdp:300,fans:2,noise:25,score:92}},
  ]},
}

export const presets = [
  { tier:'e', label:'Základ', name:'Starter Build', desc:'Kancelář, web a casual gaming v 1080p.', price:14990,
    s:{cpu:'r5-5600',gpu:'rx6600',ram:'ram16',mb:'b550',ssd:'nvme1t',psu:'psu550',case:'h510',cool:'ak620'}},
  { tier:'g', label:'Gaming', name:'Warrior Rig',   desc:'High-end 1440p gaming, streaming.', price:42990,
    s:{cpu:'r7-7700',gpu:'rtx4070',ram:'ram32ddr5',mb:'b650',ssd:'nvme2t',psu:'psu750',case:'o11',cool:'kraken'}},
  { tier:'b', label:'Pro',    name:'God Tier',       desc:'4K gaming, 3D rendering, AI workloads.', price:89990,
    s:{cpu:'r9-7950x',gpu:'rtx4090',ram:'ram32ddr5',mb:'z790',ssd:'nvme2t',psu:'psu1000',case:'mesh2',cool:'kraken'}},
]

export const fmt = n => n === 0 ? 'zdarma' : n.toLocaleString('cs') + ' Kč'

export function getItem(id) {
  for (const c of Object.values(cats)) {
    const it = c.items.find(x => x.id === id)
    if (it) return it
  }
  return null
}

export function getBestShop(it) {
  const entries = Object.entries(it.shops)
  if (!entries.length) return null
  return entries.reduce((a, b) => a[1] < b[1] ? a : b)
}
