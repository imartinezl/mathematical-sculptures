const treeData = [
    {
        title: 'Introduction',
        key: '0',
        selectable: false,
        children: [
            {
                title: 'A point of view - 010',
                key: '0-0',
                FX: 'sin(u)*10*cos(v)',
                FY: 'sin(v)+cos(u)*10*cos(v)',
                FZ: 'cos(v)+10*sin(v)*sin(u)',
                uMin: 0,
                uMax: 2 * Math.PI,
                vMin: 0,
                vMax: 2 * Math.PI,
            },
            {
                title: 'Boundaries - 012',
                key: '0-1',
                FX: 'cos(v)',
                FY: 'u + u*sin(v)*sin(u)',
                FZ: 'sin(v)*cos(u)',
                uMin: 0,
                uMax: 2 * Math.PI,
                vMin: 0,
                vMax: Math.PI,
            }
        ],
    },
    {
        title: 'Transformations',
        key: '1',
        selectable: false,
        children: [
            {
                title: 'Shaping',
                key: '1-0',
                selectable: false,
                children: [
                    {
                        title: 'Shaping 018',
                        key: '1-0-0',
                        FX: 'sin(v)*cos(u)',
                        FY: 'sin(v)*sin(u)',
                        FZ: 'cos(v)',
                        uMin: 0,
                        uMax: 2 * Math.PI,
                        vMin: 0,
                        vMax: Math.PI,
                    },
                    {
                        title: 'Shaping 020 - 1',
                        key: '1-0-1',
                        FX: 'u',
                        FY: '0',
                        FZ: '0',
                        uMin: 0,
                        uMax: 2 * Math.PI,
                        vMin: 0,
                        vMax: 2 * Math.PI,
                    },
                    {
                        title: 'Shaping 020 - 2',
                        key: '1-0-2',
                        FX: 'u',
                        FY: 'cos(u)',
                        FZ: '0',
                        uMin: 0,
                        uMax: 2 * Math.PI,
                        vMin: 0,
                        vMax: 2 * Math.PI,
                    },
                ]
            },
            {
                title: 'Translating',
                key: '1-1',
                selectable: false,
                children: []
            },
            {
                title: 'Cutting',
                key: '1-2',
                selectable: false,
                children: []
            },
            {
                title: 'Rotating',
                key: '1-3',
                selectable: false,
                children: []
            },
            {
                title: 'Reflecting',
                key: '1-4',
                selectable: false,
                children: []
            },
            {
                title: 'Scaling',
                key: '1-5',
                selectable: false,
                children: []
            },
            {
                title: 'Modulating',
                key: '1-6',
                selectable: false,
                children: []
            },
            {
                title: 'Ascending',
                key: '1-7',
                selectable: false,
                children: []
            },
            {
                title: 'Spiraling',
                key: '1-8',
                selectable: false,
                children: []
            },
            {
                title: 'Texturing',
                key: '1-9',
                selectable: false,
                children: []
            },
            {
                title: 'Bending',
                key: '1-10',
                selectable: false,
                children: []
            },
            {
                title: 'Pinching',
                key: '1-11',
                selectable: false,
                children: []
            },
            {
                title: 'Flattening',
                key: '1-12',
                selectable: false,
                children: []
            },
            {
                title: 'Thickening',
                key: '1-13',
                selectable: false,
                children: []
            }
        ]
    },
    {
        title: 'Combining Transformations',
        key: '2',
        selectable: false,
        children: [
            {
                title: 'Cutting and Spiralling',
                key: '2-0',
                selectable: false,
                children: []
            },
            {
                title: 'Scalling and Spiralling',
                key: '2-1',
                selectable: false,
                children: []
            },
            {
                title: 'Modulating and Spiralling',
                key: '2-2',
                selectable: false,
                children: []
            },
            {
                title: 'Spiralling and Ascending',
                key: '2-3',
                selectable: false,
                children: []
            },
            {
                title: 'Texturing and Spiralling',
                key: '2-4',
                selectable: false,
                children: []
            },
            {
                title: 'Bending and Spiralling',
                key: '2-5',
                selectable: false,
                children: []
            },
            {
                title: 'Spiralling and Bending',
                key: '2-6',
                selectable: false,
                children: []
            },
            {
                title: 'Pinching and Spiralling',
                key: '2-7',
                selectable: false,
                children: []
            },
            {
                title: 'Flattening and Spiralling',
                key: '2-8',
                selectable: false,
                children: []
            },
            {
                title: 'Spiralling and Flattening',
                key: '2-9',
                selectable: false,
                children: []
            },
            {
                title: 'Spiralling and Thickening',
                key: '2-10',
                selectable: false,
                children: []
            }
        ]
    },
    {
        title: 'Combining Shapes',
        key: '3',
        selectable: false,
        children: [
            {
                title: 'A Mound',
                key: '3-0',
                selectable: false,
                children: []
            },
            {
                title: 'A Meandering Mound',
                key: '3-1',
                selectable: false,
                children: []
            },
            {
                title: 'A Leaning Mound',
                key: '3-2',
                selectable: false,
                children: []
            },
            {
                title: 'A Stepper Mound',
                key: '3-3',
                selectable: false,
                children: []
            },
            {
                title: 'A Creased Mound',
                key: '3-4',
                selectable: false,
                children: []
            },
            {
                title: 'A Creassed and Pinched Mound',
                key: '3-5',
                selectable: false,
                children: []
            },
            {
                title: 'A Wedge',
                key: '3-6',
                selectable: false,
                children: []
            },
            {
                title: 'A Ridge and Trench',
                key: '3-7',
                selectable: false,
                children: []
            },
            {
                title: 'Two Ridges',
                key: '3-8',
                selectable: false,
                children: []
            },
            {
                title: 'Another Ridge and Trench',
                key: '3-9',
                selectable: false,
                children: []
            },
            {
                title: 'A Valley',
                key: '3-10',
                selectable: false,
                children: []
            },
            {
                title: 'Moguls',
                key: '3-11',
                selectable: false,
                children: []
            }
        ]
    },
    {
        title: 'Analyzing',
        key: '4',
        selectable: false,
        children: [
            {
                title: 'Japan Pavilion - Shigery Ban Architects',
                key: '4-0',
                selectable: false,
                children: []
            },
            {
                title: 'UK Pavilion - Heatherwick Studio',
                key: '4-1',
                selectable: false,
                children: []
            },
            {
                title: 'Mur Island - Acconci Studio',
                key: '4-2',
                selectable: false,
                children: []
            },
            {
                title: 'Son-O-House - NOX/Lars Spurbroek',
                key: '4-3',
                selectable: false,
                children: []
            },
            {
                title: 'Ark Nova - Arata Isozaki and Anish Kapoor',
                key: '4-4',
                selectable: false,
                children: []
            },
            {
                title: 'Looptecture F - Endo Shuhei Architect Institute',
                key: '4-5',
                selectable: false,
                children: []
            },
            {
                title: 'Mercedes-Benz Museum - UNStudio',
                key: '4-6',
                selectable: false,
                children: []
            }
        ]
    },
    {
        title: 'Developing Surfaces',
        key: '5',
        selectable: false,
        children: [
            {
                title: 'Plane to Cylinder',
                key: '5-0',
                selectable: false,
                children: [
                    {
                        title: 'Cylinder with Ascending',
                        key: '5-0-0',
                        selectable: false,
                        children: []
                    },
                    {
                        title: 'Cylinder with Texturing and Ascending',
                        key: '5-0-1',
                        selectable: false,
                        children: []
                    },
                    {
                        title: 'Cylinder with Flattening, Texturing and Ascending',
                        key: '5-0-2',
                        selectable: false,
                        children: []
                    },
                    {
                        title: 'Cylinder with Modulating, Flattering and Texturing',
                        key: '5-0-3',
                        selectable: false,
                        children: []
                    }
                ]
            },
            {
                title: 'Plane to Cone',
                key: '5-1',
                selectable: false,
                children: [
                    {
                        title: 'Cone with Spiralling',
                        key: '5-1-0',
                        selectable: false,
                        children: []
                    },
                    {
                        title: 'Cone with Spiralling and Texturing',
                        key: '5-1-1',
                        selectable: false,
                        children: []
                    },
                    {
                        title: 'Cone with Spiralling, Texturing and Modulating',
                        key: '5-1-2',
                        selectable: false,
                        children: []
                    },
                    {
                        title: 'Cone with Spiralling, Texturing and More Modulating',
                        key: '5-1-3',
                        selectable: false,
                        children: []
                    }
                ]
            }
        ]
    }
];

export default treeData;