"use strict";
import assert from 'assert'
import {floatsToBase64} from "../src/lib/arrayToBase64.mjs";

describe("final test", async () => {


    before('run once before',async () => {


        assert.ok(true)
    })


    after('run once after',async () => {

        assert.ok(true)
    })

    describe("no security", async () => {

        beforeEach(() => {
            console.log("beforeEach executes before every test");
        });

        it("should convert an array of float to base64 ", async () => {
            const floatsArray =  [
                [ -3940284.0881079664, 2529651.3521688143, -4316352.956591235 ],
                [ -3940286.562472451, 2529651.9425937803, -4316349.642532065 ],
                [ -3940289.0868873927, 2529652.5651511205, -4316346.383669202 ],
                [ -3940291.66125532, 2529653.2197782183, -4316343.179897646 ],
                [ -3940294.28549997, 2529653.9064260735, -4316340.031130331 ],
                [ -3940296.959561641, 2529654.6250563166, -4316336.937303912 ],
                [ -3940299.683401766, 2529655.3756441637, -4316333.898372908 ],
                [ -3940302.4569989257, 2529656.1581758102, -4316330.914314826 ],
                [ -3940305.280350505, 2529656.972649546, -4316327.985127913 ],
                [ -3940308.153474431, 2529657.819076843, -4316325.110828992 ],
                [ -3940311.076405191, 2529658.697479799, -4316322.291458583 ]
              ];
              const floats =[]
              for (let i=0;i<floatsArray.length;i++) {
                floatsArray[i][0]=floatsArray[i][0]+3940200

                floatsArray[i][1]=floatsArray[i][1]-2528000
                floatsArray[i][2]=floatsArray[i][2]+4317200
            //  floatsArray.forEach(item=>item.map(i => i[0]+3940200,i[1]-2528000,i[2]+4317200))
                floats.push(floatsArray[i][0])
                floats.push(floatsArray[i][1])
                floats.push(floatsArray[i][2])
              }
             console.log(floatsArray);
             console.log(floats);
             
            console.log(floatsToBase64(floats));
            assert.ok(true)
        });

        it("should do something else ", async () => {
            assert.strictEqual(200, 200)
        });


    });


});


