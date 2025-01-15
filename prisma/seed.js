import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

   // Clear existing data (optional)
   //await prisma.project.deleteMany({});
   await prisma.projectPolygon.deleteMany({});
   await prisma.polygonStyle.deleteMany({});
   //await prisma.popupDetails.deleteMany({});
   //await prisma.projectDetails.deleteMany({}); // Clear ProjectDetails
   //await prisma.pOI.deleteMany({});
   //await prisma.pOIType.deleteMany({});
 
  // Seed Projects
  // await prisma.project.createMany({
  //   data: [
  //     {
  //       id: '1736887548682',
  //       name: 'The Gate Tower',
  //       lat: 24.49399553208230885,
  //       lng: 54.40846900848679724,
  //       description: 'Being a gateway to the promising New Alamein, The Gate towers consist of 44 floors with a range of studios and four-bedroom apartments.',
  //       hideMarker: false,
  //       zoom: 14,
  //       createdAt: new Date(1736887585890),
  //       updatedAt: new Date(1736946289049),
  //     },
  //     {
  //       id: '1736887697679',
  //       name: 'Dunes Villa',
  //       lat: 24.52061709061903016,
  //       lng: 54.44299807683208314,
  //       description: 'The Dunes at Saadiyat Reserve by Aldar Properties is a newly launched development that presents 4 & 5-bedroom sustainable designed villas within Saadiyat Island, Abu Dhabi.',
  //       hideMarker: false,
  //       zoom: 14,
  //       createdAt: new Date(1736887737709),
  //       updatedAt: new Date(1736946294179),
  //     },
  //     {
  //       id: '1736887793161',
  //       name: 'The Grove Saadiyat',
  //       lat: 24.53694929427627969,
  //       lng: 54.40944199474637344,
  //       description: 'Saadiyat Grove is an inclusive community complex transforming the way people live, stay, shop and play.',
  //       hideMarker: false,
  //       zoom: 14,
  //       createdAt: new Date(1736887831659),
  //       updatedAt: new Date(1736946300502),
  //     },
  //   ],
  // });

  // Seed ProjectPolygon
  await prisma.projectPolygon.createMany({
    data: [
      {
        id: '1736887582705',
        name: 'The Gate Tower',
        description: '',
        type: 'Polygon',
        coordinates: '[[54.40647912268045,24.494092806720516],[54.4074082842352,24.493194884134084],[54.40813187907369,24.492768368658773],[54.40926660734357,24.49241667937234],[54.40976819012951,24.492341851738118],[54.40966951810512,24.493352021048835],[54.40966129543639,24.49413022002176],[54.40984219414662,24.494721348715956],[54.41025332757809,24.495521986946926],[54.40989975282753,24.495866184993517],[54.409710631448604,24.49597094073367],[54.40954617807577,24.495941010530757],[54.40823055109689,24.495102961966893],[54.40716982684407,24.49454924824424],[54.40647912268045,24.494092806720516]]',
        popupDetailsId: '45b6e77e9dbc43e9994cfe94022ccc24',
        minZoom: null,
        maxZoom: null,
        createdAt: new Date(1736887585890),
        updatedAt: new Date(1736946289049),
        projectId: '1736887548682',
      },
      {
        id: '1736887734993',
        name: 'Dunes Villa',
        description: '',
        type: 'Polygon',
        coordinates: '[[54.43886327369816,24.524019762237003],[54.44426552904892,24.518972432958506],[54.446052428894546,24.519634079434084],[54.44657187652487,24.519558462870393],[54.44690432300814,24.519312708724556],[54.44713287996436,24.519426133774573],[54.44717443577517,24.519709695952272],[54.44723676949138,24.519879832951915],[54.446114762610705,24.52105188157398],[54.44650954280863,24.52184584378189],[54.44482653248849,24.52303677768346],[54.4439123046603,24.524738092237513],[54.44333052331535,24.526307061897214],[54.442083849003836,24.52776259453404],[54.44114884326868,24.52840529188704],[54.43998528057884,24.5273845357313],[54.43934116551773,24.52596680508161],[54.43923727599227,24.524870415736714],[54.43886327369816,24.524019762237003]]',
        popupDetailsId: 'b6e7b41b70b14b6dadf13089d4c9c208',
        minZoom: null,
        maxZoom: null,
        createdAt: new Date(1736887737709),
        updatedAt: new Date(1736946294179),
        projectId: '1736887697679',
      },
      {
        id: '1736887829804',
        name: 'The Grove Saadiyat',
        description: '',
        type: 'Polygon',
        coordinates: '[[54.40685364709827,24.537469496279783],[54.41161901583078,24.53681239865378],[54.41160898347542,24.535288283971525],[54.41156768331402,24.53290784488935],[54.41010455341353,24.53415494189258],[54.40685364709827,24.537469496279783]]',
        popupDetailsId: '13752916a32e46deb530d1cb3f64e00e',
        minZoom: null,
        maxZoom: null,
        createdAt: new Date(1736887831659),
        updatedAt: new Date(1736946300502),
        projectId: '1736887793161',
      },
    ],
  });
  // Seed PolygonStyle
  await prisma.polygonStyle.createMany({
    data: [
      {
        id: '8eebf976759245de9a98d7fedea094b7',
        fillColor: '#8274ec',
        hoverFillColor: '#a96db0',
        fillOpacity: 0.7,
        hoverFillOpacity: 0.7,
        lineColor: null,
        lineWidth: 1,
        lineOpacity: 1.0,
        lineDashArray: null,
        createdAt: new Date(1736887585890),
        updatedAt: new Date(1736946289049),
        polygonId: '1736887582705',
      },
      {
        id: '770f2425c6dc4d95b8f1bc80e6fc93c7',
        fillColor: '#d283c8',
        hoverFillColor: '#d09a9a',
        fillOpacity: 0.7,
        hoverFillOpacity: 0.7,
        lineColor: null,
        lineWidth: 1,
        lineOpacity: 1.0,
        lineDashArray: null,
        createdAt: new Date(1736887737709),
        updatedAt: new Date(1736946294179),
        polygonId: '1736887734993',
      },
      {
        id: '4bf5e4f8fa6b4c619909784cfa221647',
        fillColor: '#d392d0',
        hoverFillColor: '#d7a2a2',
        fillOpacity: 0.7,
        hoverFillOpacity: 0.7,
        lineColor: null,
        lineWidth: 1,
        lineOpacity: 1.0,
        lineDashArray: null,
        createdAt: new Date(1736887831659),
        updatedAt: new Date(1736946300502),
        polygonId: '1736887829804',
      },
    ],
  });

  // Seed PopupDetails
  // await prisma.popupDetails.createMany({
  //   data: [
  //     {
  //       id: '45b6e77e9dbc43e9994cfe94022ccc24',
  //       title: 'The Gate Tower',
  //       image: 'https://media.istockphoto.com/id/517465184/photo/famous-buildings-in-abu-dhabi.jpg?s=1024x1024&w=is&k=20&c=qFa0hSPbOQZKsKdtBh3Qr2Oj_4_dsNAMzEoi3En_JXI=',
  //       description: 'Being a gateway to the promising New Alamein, The Gate towers consist of 44 floors with a range of studios and four-bedroom apartments.',
  //       link: '',
  //       type: 'details',
  //       ariealLink: '',
  //       imagesLink: '',
  //       videoLink: '',
  //     },
  //     {
  //       id: 'b6e7b41b70b14b6dadf13089d4c9c208',
  //       title: 'Dunes Villa',
  //       image: 'https://assets.bayut.com/content/the_gate_tower_16_9_2020_e457c5cab0_d70dba31db.jpg',
  //       description: 'The Dunes at Saadiyat Reserve by Aldar Properties',
  //       link: '',
  //       type: 'details',
  //       ariealLink: 'https://assets.bayut.com/content/the_gate_tower_16_9_2020_e457c5cab0_d70dba31db.jpg',
  //       imagesLink: 'https://assets.bayut.com/content/the_gate_tower_16_9_2020_e457c5cab0_d70dba31db.jpg',
  //       videoLink: 'https://assets.bayut.com/content/the_gate_tower_16_9_2020_e457c5cab0_d70dba31db.jpg',
  //     },
  //     {
  //       id: '13752916a32e46deb530d1cb3f64e00e',
  //       title: 'The Grove Saadiyat',
  //       image: 'https://psinv.net/assets/uploads/images/9ff394e5-914b-4b42-8f92-47bf5d8ea7f9/general-images2-n-a--0x0.jpg',
  //       description: 'Saadiyat Grove is an inclusive community complex transforming the way people live, stay, shop and play.',
  //       link: '',
  //       type: 'details',
  //       ariealLink: '',
  //       imagesLink: '',
  //       videoLink: '',
  //     },
  //   ],
  // });

  // Seed POIType
  // await prisma.pOIType.createMany({
  //   data: [
  //     {
  //       id: '40bd7386fe9844cba9e9c70dd23ed263',
  //       name: 'hospital',
  //       icon: 'hospital',
  //       color: '#FF4136',
  //       createdAt: new Date(1736872115343),
  //       updatedAt: new Date(1736872115343),
  //     },
  //     {
  //       id: '6c10b4074b8d468e848236365d651c2c',
  //       name: 'school',
  //       icon: 'school',
  //       color: '#4B9CD3',
  //       createdAt: new Date(1736872115346),
  //       updatedAt: new Date(1736872115346),
  //     },
  //     {
  //       id: 'b305d0dd3db34012a5d01dd20efc968f',
  //       name: 'mosque',
  //       icon: 'mosque',
  //       color: '#2ECC40',
  //       createdAt: new Date(1736872115347),
  //       updatedAt: new Date(1736872115347),
  //     },
  //     {
  //       id: '5575ca30dbe74cde868b66390b7257b9',
  //       name: 'store',
  //       icon: 'store',
  //       color: '#FF851B',
  //       createdAt: new Date(1736872115348),
  //       updatedAt: new Date(1736872115348),
  //     },
  //     {
  //       id: 'b8665a59203f4f988fb7f0738f175f42',
  //       name: 'park',
  //       icon: 'park',
  //       color: '#3D9970',
  //       createdAt: new Date(1736872115349),
  //       updatedAt: new Date(1736872115349),
  //     },
  //     {
  //       id: '76e2adefac5c4f3a8d2e38a3281ec434',
  //       name: 'beach',
  //       icon: 'beach',
  //       color: '#FFDC00',
  //       createdAt: new Date(1736899818253),
  //       updatedAt: new Date(1736899818253),
  //     },
  //     {
  //       id: '6bf8e06923244060b24c0c1863e6910f',
  //       name: 'landmark',
  //       icon: 'landmark',
  //       color: '#85144b',
  //       createdAt: new Date(1736899818255),
  //       updatedAt: new Date(1736899818255),
  //     },
  //   ],
  // });

  // Seed POI
  // await prisma.pOI.createMany({
  //   data: [
  //     {
  //       id: 'c452a89c57614d468c3d046a195461c7',
  //       title: 'Mamsha Al Saadiyat Beach',
  //       lat: 24.54125903570071899,
  //       lng: 54.42342751074625085,
  //       typeId: '76e2adefac5c4f3a8d2e38a3281ec434',
  //       createdAt: new Date(1736925054531),
  //       updatedAt: new Date(1736925054531),
  //     },
  //     {
  //       id: '146c677066e74864935928c1b91b3b2e',
  //       title: 'Zayed National Museum',
  //       lat: 24.53369246083821054,
  //       lng: 54.40668334906180803,
  //       typeId: '6bf8e06923244060b24c0c1863e6910f',
  //       createdAt: new Date(1736925152063),
  //       updatedAt: new Date(1736925152063),
  //     },
  //     {
  //       id: '858f721da2b0464f8c846e206b980076',
  //       title: 'Louvre Abu Dhabi',
  //       lat: 24.53375243074125933,
  //       lng: 54.39876909819560069,
  //       typeId: '6bf8e06923244060b24c0c1863e6910f',
  //       createdAt: new Date(1736925214102),
  //       updatedAt: new Date(1736925214102),
  //     },
  //     {
  //       id: '4b981bd850c24c249fcebdd582da3bda',
  //       title: 'American Community School of Abu Dhabi',
  //       lat: 24.52381789214031116,
  //       lng: 54.43464320920938349,
  //       typeId: '6c10b4074b8d468e848236365d651c2c',
  //       createdAt: new Date(1736925260384),
  //       updatedAt: new Date(1736925260384),
  //     },
  //     {
  //       id: 'e9e3b3437f854de68336aed87c980b4f',
  //       title: 'Reem Hospital',
  //       lat: 24.49119198477092141,
  //       lng: 54.41270200089356734,
  //       typeId: '40bd7386fe9844cba9e9c70dd23ed263',
  //       createdAt: new Date(1736925288318),
  //       updatedAt: new Date(1736925288318),
  //     },
  //     {
  //       id: '6dc7587e1a1f4a37800eb1319575b462',
  //       title: 'Reem Centeral Park',
  //       lat: 24.50350326071599837,
  //       lng: 54.40645419149267781,
  //       typeId: 'b8665a59203f4f988fb7f0738f175f42',
  //       createdAt: new Date(1736925301545),
  //       updatedAt: new Date(1736925301545),
  //     },
  //     {
  //       id: '6ca75f4282db442e88cd7de985dc07fa',
  //       title: 'Cove Beach',
  //       lat: 24.5017897365173205,
  //       lng: 54.41731344407031657,
  //       typeId: '76e2adefac5c4f3a8d2e38a3281ec434',
  //       createdAt: new Date(1736925316857),
  //       updatedAt: new Date(1736925316857),
  //     },
  //   ],
  // });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });