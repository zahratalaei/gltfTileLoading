fetch('transformed_coordinates.json')
    .then(response => response.json())
    .then(array => {
        let maxVal = -Infinity;
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        array.forEach(sublist1 => {
            sublist1.forEach(sublist2 => {
                sublist2.forEach(val => {
                    maxVal = Math.max(maxVal, Math.abs(val));
                });

                minX = Math.min(minX, sublist2[0]);
                maxX = Math.max(maxX, sublist2[0]);
                minY = Math.min(minY, sublist2[1]);
                maxY = Math.max(maxY, sublist2[1]);
                minZ = Math.min(minZ, sublist2[2]);
                maxZ = Math.max(maxZ, sublist2[2]);
            });
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;
        console.log(`Center of Bounding Box: (${centerX}, ${centerY}, ${centerZ})`);

        const scale = 100;

        const scaledArray = array.map(sublist1 => 
            sublist1.map(sublist2 => 
                sublist2.map(val => {
                    const scaled = val * scale / maxVal;
                    // Here's the rounding to 7 decimal places
                    const rounded = parseFloat(scaled.toFixed(7));
                    return rounded;
                })
            )
        );

        const blob = new Blob([JSON.stringify(scaledArray, null, 4)], { type: 'application/json' });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'scaled_data.json';
        a.textContent = 'Download scaled data';

        document.body.appendChild(a);
    })
    .catch(error => {
        console.error("There was an error processing the file:", error);
    });
