/*! Terminal 7 Tests
 *  This file contains the code that tests terminal 7 - a webrtc based
 *  touchable terminal multiplexer.
 *
 *  Copyright: (c) 2020 Benny A. Daon - benny@tuzig.com
 *  License: GPLv3
 */
import { Terminal7 } from "../src/terminal7.js"
import { Layout } from '../src/layout.js'
import { Cell } from '../src/cell.js'
import { assert } from "chai"


describe("terminal7", function() {
    var t, e
    /*
     * Every tests gets a fresh copy of terminal7 and a fresh dom element
     */
    beforeEach(() => {
        localStorage.clear()
        document.body.innerHTML = __html__['www/index.html']
        e = document.getElementById("terminal7")
        t = new Terminal7()
        t.open(e)
    })
    after(() => terminal7.clearTimeouts())
    describe("gate", () => {
        it("starts with no gates", () => {
            expect(t.gates.length).to.equal(0)
        })
        it("s state can be dumped", () => {
            let state = { windows: [
                { name: "hello",
                  layout: {
                        dir: "topbottom",
                        sx: 0.8,
                        sy: 0.6,
                        xoff: 0.1,
                        yoff: 0.2,
                        cells: [
                            {
                                sx: 0.8,
                                sy: 0.3,
                                xoff: 0.1,
                                yoff: 0.2,
                            }, {
                                sx: 0.8,
                                sy: 0.3,
                                xoff: 0.1,
                                yoff: 0.5,
                                active: true,
                            },
                        ],
                  },
                }, { name: "world",
                  active: true,
                  layout: {
                        dir: "rightleft",
                        sx: 0.8,
                        sy: 0.6,
                        xoff: 0.1,
                        yoff: 0.2,
                        cells: [
                            {
                                sx: 0.4,
                                sy: 0.6,
                                xoff: 0.1,
                                yoff: 0.2,
                            }, {
                                sx: 0.4,
                                sy: 0.6,
                                xoff: 0.5,
                                yoff: 0.2,
                                active: true,
                            },
                        ],
                  },
                },
            ]}
            let h = t.addGate()
            h.open(e)
            h.restoreState(state)
            expect(h.windows.length).to.equal(2)
            let w = h.activeW
            expect(w.rootLayout.dir).to.equal("rightleft")
            expect(w.name).to.equal("world")
            expect(w.rootLayout.cells[0].xoff).to.equal(0.1)
            expect(w.rootLayout.cells[1].xoff).to.equal(0.5)
            expect(w.activeP.xoff).to.equal(0.5)
            let d = h.dump()
            expect(d.windows.length).to.equal(2)
            expect(d.windows[0].layout.dir).to.equal("topbottom")
            expect(d.windows[0].layout.cells.length).to.equal(2)
            expect(d.windows[0].layout.cells[0].yoff).to.equal(0.2)
            expect(d.windows[0].layout.cells[1].yoff).to.equal(0.5)
        })
        it("has a unique name", () => {
            let g = t.addGate({name:"foo"})
            let g2 = t.addGate({name:"foo"})
            expect(g2).to.equal("Gate name is not unique")
        })
    })
    describe("window", () => {
        var h, w, p0
        beforeEach(() => {
            h = t.addGate()
            h.open(e)
            w = h.addWindow("gothic", true)
            w.activeP.sx = 0.8
            w.activeP.sy = 0.6
            w.activeP.xoff = 0.1
            w.activeP.yoff = 0.2
            p0 = w.activeP
        })
        it("is added with a cell", function() {
            assert.exists(h.windows[0])
            assert.exists(h.windows[0].name, "gothic")
        })
        it("can move it's focus a pane to the left and back", () => {
            var p1 = p0.split("topbottom")
            w.moveFocus("left")
            expect(w.activeP).to.equal(p0)
            w.moveFocus("right")
            expect(w.activeP).to.equal(p1)
        })
        it("can move it's focus a pane up and back", () => {
            var p1 = p0.split("rightleft")
            w.moveFocus("up")
            expect(w.activeP).to.equal(p0)
            w.moveFocus("down")
            expect(w.activeP).to.equal(p1)
        })
    })

    describe("cell", () => {
        var h, w, p0
        beforeEach(() => {
            h = t.addGate()
            h.open(e)
            w = h.addWindow("1,2,3 testing", true)
            w.activeP.sx = 0.8
            w.activeP.sy = 0.6
            w.activeP.xoff = 0.1
            w.activeP.yoff = 0.2
            p0 = w.activeP
        })
        it("can set and get sizes", () => {
            let c = new Cell({sx: 0.12, sy: 0.34, w: w})
            assert.equal(c.sx, 0.12)
            assert.equal(c.sy, 0.34)

        })
        it("can set and get offsets", () => {
            let c = new Cell({xoff: 0.12, yoff: 0.34,
                w: w})
            assert.equal(c.xoff, 0.12)
            assert.equal(c.yoff, 0.34)
        })
        it("has a layout", () => {
            expect(p0.layout.dir).to.equal("TBD")
            expect(p0.layout.cells).to.eql([p0])

        })
        
        it("can be split right to left", () => {
            let p1 = p0.split("rightleft", 0.5)

            expect(p0.layout.dir).to.equal("rightleft")
            expect(p0.layout.toText()).to.match(
                /^\[0.800x0.300,0.100,0.200,\d+,0.800x0.300,0.100,0.500,\d+\]/)
            // test sizes
            assert.equal(p0.sx, 0.8)
            assert.equal(p0.sy, 0.3)
            // Test offsets
            assert.equal(p0.xoff, 0.1)
            assert.equal(p0.yoff, 0.2)
            assert.equal(p1.xoff, 0.1)
            assert.equal(p1.yoff, 0.5)
        })
        it("can be split top to bottom", () => {
            let p1 = p0.split("topbottom")
            assert.exists(p1)
            assert.equal(p0.layout, t.cells[1].layout)
            assert.equal(p0.layout.dir, "topbottom")
            assert.equal(p0.layout, t.cells[1].layout)

            expect(p0.layout.toText()).to.equal(
                "{0.400x0.600,0.100,0.200,1,0.400x0.600,0.500,0.200,2}")
            expect(p0.layout.cells[0]).to.equal(p0)
            expect(p0.layout).not.to.be.a('null')
            expect(p0.layout.cells.length).to.equal(2)

            expect(p0.sy).to.equal(0.6)
            expect(p0.sx).to.equal(t.cells[1].sx)
            expect(p0.sx).to.equal(0.4)
        })
        it("can be split twice", () => {
            let p1 = p0.split("topbottom"),
                p2 = p1.split("topbottom")
            expect(p0.layout.toText()).to.equal(
                "{0.400x0.600,0.100,0.200,1,0.200x0.600,0.500,0.200,2,0.200x0.600,0.700,0.200,3}")
            assert.exists(p2)
            expect(p0.layout).not.to.be.a('null')
            expect(p1.layout).equal(p0.layout)
            expect(p2.layout).equal(p1.layout)
            assert.equal(p0.layout, p1.layout)
            assert.equal(p1.layout, p2.layout)
            assert.equal(p0.sy, 0.6)
            assert.equal(p1.sy, 0.6)
            assert.equal(p2.sy, 0.6)
            assert.equal(p0.sx, 0.4)
            assert.equal(p1.sx, 0.2)
            assert.equal(p2.sx, 0.2)
            assert.equal(p0.xoff, 0.1)
            assert.equal(p1.xoff, 0.5)
            assert.equal(p2.xoff, 0.7)
            assert.equal(p0.yoff, 0.2)
            assert.equal(p1.yoff, 0.2)
            assert.equal(p2.yoff, 0.2)
        })
        it("can zoom, hiding all other cells", function () {
        })
        it("can resize", function () {
        })
        it("can close nicely, even with just a single cell", function () {
        })
        it("can close nicely, with layout resizing", function () {
            let p1 = p0.split("topbottom")
            expect(p0.layout.toText()).to.equal(
                "{0.400x0.600,0.100,0.200,1,0.400x0.600,0.500,0.200,2}")
            let p2 = p1.split("rightleft")
            expect(p0.layout.toText()).to.equal(
                "{0.400x0.600,0.100,0.200,1,0.400x0.600,0.500,0.200[0.400x0.300,0.500,0.200,2,0.400x0.300,0.500,0.500,4]}")
            expect(p0.layout).not.null
            expect(p1.layout).not.null
            expect(p1.layout).equal(p2.layout)
            expect(p0.layout).not.equal(p1.layout)
            expect(p0.layout.cells).eql([p0, p1.layout])
            expect(p1.layout.cells).eql([p1, p2])
            let es = document.getElementsByClassName('layout')
            assert.equal(es.length, 2)
            assert.equal(p1.sy, 0.3)
            p2.close()
            assert.equal(p1.yoff, 0.2)
            assert.equal(p1.sy, 0.6)
            p1.close()
            expect(p0.sy).equal(0.6)
            expect(p0.sx).equal(0.8)
            es = document.getElementsByClassName('layout')
            assert.equal(es.length, 1)
        })
        it("can close out of order", function () {
            let p1 = p0.split("topbottom")
            p1.close()
            assert.equal(p0.sy, 0.6)
        })
        it("can open a |- layout ", function () {
            let p1 = p0.split("topbottom"),
                p2 = p1.split("rightleft")
            p0.close()
            expect(p1.sy).to.equal(0.3)
            expect(p2.sy).to.equal(0.3)
            expect(p1.sx).to.equal(0.8)
            expect(p2.sx).to.equal(0.8)
        })
        it("can handle three splits", function() {
            let p1 = p0.split("topbottom"),
                p2 = p1.split("rightleft"),
                p3 = p2.split("topbottom")
            p1.close()
            expect(p2.sy).to.equal(0.6)
            expect(p3.sy).to.equal(0.6)
            expect(p2.yoff).to.equal(0.2)
            expect(p3.yoff).to.equal(0.2)
        })
        it("can handle another three splits", function() {
            let p1 = p0.split("topbottom"),
                p2 = p1.split("rightleft"),
                p3 = p2.split("topbottom")
            expect(p0.layout.toText()).to.equal(
                "{0.400x0.600,0.100,0.200,1,0.400x0.600,0.500,0.200[0.400x0.300,0.500,0.200,2,0.400x0.300,0.500,0.500{0.200x0.300,0.500,0.500,4,0.200x0.300,0.700,0.500,6}]}")
            p0.close()
            expect(p1.sx).to.equal(0.8)
            expect(p2.sx).to.equal(0.4)
            expect(p3.sx).to.equal(0.4)
            expect(p1.sy).to.equal(0.3)
            expect(p2.sy).to.equal(0.3)
            expect(p3.sy).to.equal(0.3)
        })
        it("can zoom in-out-in", function() {
            let p1 = p0.split("topbottom")
            expect(p0.e.style.display).to.equal('')
            expect(p0.sx).to.equal(0.4)
            p0.toggleZoom()
            //TODO: test the terminal is changing size 
            //expect(p0.t.rows).above(r0)
            expect(p0.zoomedE).to.exist
            expect(p0.zoomedE.classList.contains("zoomed")).to.be.true
            expect(p0.zoomedE.children[0].classList.contains("pane")).to.be.true
            expect(p0.zoomedE.children[0].classList.contains("pane")).to.be.true
            p0.toggleZoom()
            expect(p0.zoomedE).to.be.null
            expect(p0.sx).to.equal(0.4)
            p0.toggleZoom()
            expect(p0.zoomedE).to.exist
            expect(p0.zoomedE.classList.contains("zoomed")).to.be.true
            expect(p0.zoomedE.children[0].classList.contains("pane")).to.be.true
        })

    })
    describe("pane", () => {
        it("can be stored & loaded", function() {
            debugger
            t.addGate({
                addr: 'localgate',
                user: 'guest',
                store: true
            })
            t.addGate({
                addr: 'badwolf',
                user: 'root',
                store: true
            })
            t.storeGates()
            let t2 = new Terminal7(),
                e = document.createElement("div")
            t2.open(e)
            expect(t2.gates.length).to.equal(2)
            expect(t2.gates[0].user).to.equal("guest")
            expect(t2.gates[1].user).to.equal("root")
        })
    })
    describe("layout", () => {
        var h, w, p0 
        it("can be restored from a simple layout and dumped", () => {
            let state = {
                dir: "topbottom",
                sx: 0.8,
                sy: 0.6,
                xoff: 0.1,
                yoff: 0.2,
                cells: [
                    {
                        sx: 0.8,
                        sy: 0.3,
                        xoff: 0.1,
                        yoff: 0.2,
                    }, {
                        sx: 0.8,
                        sy: 0.3,
                        xoff: 0.1,
                        yoff: 0.5,
                    }
                ]}
            h = t.addGate()
            h.open(e)
            w = h.addWindow("restored")
            w.restoreLayout(state)
            expect(w.rootLayout.dir).to.equal("topbottom")
            expect(w.rootLayout.cells[0].yoff).to.equal(0.2)
            expect(w.rootLayout.cells[1].yoff).to.equal(0.5)
            let d = w.dump()
            expect(d.dir).to.equal("topbottom")
            expect(d.cells.length).to.equal(2)
            expect(d.cells[0].yoff).to.equal(0.2)
            expect(d.cells[1].yoff).to.equal(0.5)
        })
        it("can be restored from a -| layout", () => {
            h = t.addGate()
            h.open(e)
            w = h.addWindow("restored")
            w.restoreLayout({
                "dir": "topbottom",
                "cells": [
                    {
                        sx: 0.8,
                        sy: 0.3,
                        xoff: 0.1,
                        yoff: 0.2,
                        pane_id: 12
                    }, {
                        dir: "rightleft",
                        cells: [
                            {
                                sx: 0.4,
                                sy: 0.3,
                                xoff: 0.1,
                                yoff: 0.5,
                                pane_id: -1
                            }, {
                                sx: 0.4,
                                sy: 0.3,
                                xoff: 0.5,
                                yoff: 0.5,
                                pane_id: -1
                            }
                        ]
                    }
                ]}
            )
            expect(w.rootLayout.dir).to.equal("topbottom")
            expect(w.rootLayout.cells.length).to.equal(2)
            expect(w.rootLayout.cells[1].dir).to.equal("rightleft")
            expect(w.rootLayout.cells[1].cells.length).to.equal(2)
        })

        it("can move a border between panes", function () {
            h = t.addGate()
            h.open(e)
            w = h.addWindow("1,2,3 testing", true)
            w.activeP.sx = 0.8
            w.activeP.sy = 0.6
            w.activeP.xoff = 0.1
            w.activeP.yoff = 0.2
            p0 = w.activeP
            let p1 = p0.split("rightleft")
            expect(p0.sy).to.equal(0.3)
            expect(p1.sy).to.equal(0.3)
            window.toBeFit = new Set([])
            p0.layout.moveBorder(p1, "top", 0.6)
            expect(p0.sy).to.be.closeTo(0.4, 0.00000001)
            expect(p1.sy).to.be.closeTo(0.2, 0.00000001)
            expect(p1.yoff).to.equal(0.6)
            p0.layout.moveBorder(p1, "top", 0.5)
            expect(p0.sy).to.be.closeTo(0.3, 0.00000001)
            expect(p1.sy).to.be.closeTo(0.3, 0.00000001)

        })
        it("can move a border in complex layout panes", function () {
            /* here's the layout we build and then move the border between
             * 1 to 2
            +----------+---+
            |          |   |
            |     1    |   |
            |          |   |
            +----+-----+ 2 |
            |    |     |   |
            | 3  | 4   |   |
            |    |     |   |
            +----+-----+---+
            */
            h = t.addGate()
            h.open(e)
            w = h.addWindow("1,2,3 testing", true)
            w.activeP.sx = 0.8
            w.activeP.sy = 0.6
            w.activeP.xoff = 0.1
            w.activeP.yoff = 0.2
            let p1 = w.activeP,
                p2 = p1.split("topbottom"),
                p3 = p1.split("rightleft"),
                p4 = p3.split("topbottom")
            expect(p4.xoff+p4.sx).to.equal(p2.xoff)
            expect(p3.sx).to.equal(0.2)
            window.toBeFit = new Set([])
            p2.layout.moveBorder(p2, "left", 0.6)
            expect(p1.sx).to.equal(0.5)
            expect(p3.sx).to.equal(0.25)
            expect(p4.sx).to.equal(0.25)
            expect(p4.xoff+p4.sx).to.be.closeTo(p2.xoff, 0.000001)
        })
        it("can move a border in another complex layout panes", function () {
            /* here's the layout we build and then move the border between
             * 1 to 2
            +---------+----------+
            |         |    3     |
            |    1    +----------+
            |         |    4     |
            |         |          |
            +---------+-----------+
            |                    |
            |          2         |
            |                    |
            |                    |
            +--------------------+
            */
            const g = t.addGate()
            g.open(e)
            w = g.addWindow("1,2,3 testing", true)
            w.activeP.sx = 0.8
            w.activeP.sy = 0.6
            w.activeP.xoff = 0.1
            w.activeP.yoff = 0.2
            let p1 = w.activeP,
                p2 = p1.split("rightleft"),
                p3 = p1.split("topbottom"),
                p4 = p3.split("rightleft")
            expect(p4.yoff+p4.sy).to.equal(p2.yoff)
            expect(p3.sy).to.equal(0.15)
            window.toBeFit = new Set([])
            p2.layout.moveBorder(p2, "top", 0.6)
            expect(p1.sy).to.equal(0.4)
            expect(p3.sy).to.equal(0.2)
            expect(p4.sy).to.equal(0.2)
            expect(p4.yoff+p4.sy).to.be.closeTo(p2.yoff, 0.000001)
        })
    })
})
