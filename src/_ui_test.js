// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
(function() {
	"use strict";

	describe("UI", function() {
		var preload;
		var error;
		var content;

		var samples;
		var userCode;
		var showBuiltins;
		var showAllFunctions;
		var evaluate;
		var graph;

		beforeEach(function() {
			document.body.innerHTML +=
				"<div id='loading'>Loading</div>" +
				"<div id='error'>Error</div>" +
				"<div id='content'>" +
					"<ul id='samples'></ul>" +
					"<div id='userCode'></div>" +
					"<input id='evaluate' type='submit'>" +
					"<input id='builtins' type='checkbox'>" +
					"<input id='functions' type='checkbox'>" +
					"<div id='graph'></div>" +
				"</div>";

			preload = document.getElementById("loading");
			error = document.getElementById("error");
			content = document.getElementById("content");
			samples = document.getElementById("samples");
			userCode = document.getElementById("userCode");
			evaluate = document.getElementById("evaluate");
			showBuiltins = document.getElementById("builtins");
			showAllFunctions = document.getElementById("functions");
			graph = document.getElementById("graph");

			initialize();

		});

		function initialize() {
			jdls.ui.initialize({
				preloadDiv: preload,
				errorDiv: error,
				contentDiv: content,
				samplesList: samples,
				userCodeDiv: userCode,
				evaluateButton: evaluate,
				showBuiltinsCheckbox: showBuiltins,
				showAllFunctionsCheckbox: showAllFunctions,
				graphDiv: graph
			});

		}

		afterEach(function() {
			document.body.removeChild(preload);
			document.body.removeChild(content);
		});

		describe("initialization", function() {
			var defaultSample;

			beforeEach(function() {
				defaultSample = jdls.usercode.DEFAULT_SAMPLE;
			});

			it("hides pre-load div and displays content div", function() {
				expect(preload.style.display).to.equal("none");
				expect(error.style.display).to.equal("none");
				expect(content.style.display).to.equal("block");
			});

			it("populates sample buttons", function() {
				expect(samples.innerHTML).to.contain(defaultSample.name);
			});

			it("integrates CodeMirror input area sucessfully", function() {
				expect(userCode.firstElementChild.innerHTML).to.contain("CodeMirror-scroll");
			});

			it("puts default user code into text area", function() {
				expect(cm.getValue()).to.equal(defaultSample.code);
			});

			it("draws graph", function() {
				expect(graph.innerHTML).to.contain("Generated by graphviz");
			});

			it("displays error div if exception thrown", function() {
				// simulate IE 8 behavior
				var patchedMethod = Object.getOwnPropertyNames;
				try {
					delete Object.getOwnPropertyNames;
					initialize();
					expect(preload.style.display).to.equal("none");
					expect(error.style.display).to.equal("block");
					expect(content.style.display).to.equal("none");
				}
				finally {
					Object.getOwnPropertyNames = patchedMethod;
				}
			});

			it("displays error div if Int32Array not present", function() {
				/*global Int32Array:true */
				// simulate IE 9 behavior
				var patchedClass = Int32Array;
				try {
					Int32Array = undefined;
					initialize();
					expect(preload.style.display).to.equal("none");
					expect(error.style.display).to.equal("block");
					expect(content.style.display).to.equal("none");
				}
				finally {
					Int32Array = patchedClass;
				}
			});
		});

		describe("options", function() {
			it("respects 'show builtins' checkbox", function() {
				cm.setValue("this.a = [];");
				showBuiltins.checked = true;
				evaluate.click();
				expect(graph.innerHTML).to.contain("Array()");
			});

			it("respects 'show all functions' checkbox", function() {
				cm.setValue("this.a = function a() {};");
				showAllFunctions.checked = true;
				evaluate.click();
				expect(graph.innerHTML).to.contain("constructor");
			});
		});

		describe("interactivity", function() {
			it("re-draws graph when evaluate button clicked", function() {
				cm.setValue("this.test_marker = 1;");
				evaluate.click();
				expect(graph.innerHTML).to.contain("test_marker");
			});

			it("populates text area and re-evaluates when sample button clicked", function() {
				cm.setValue("this.test_marker = 1;");
				evaluate.click();

				var firstSample = jdls.usercode.samples[Object.getOwnPropertyNames(jdls.usercode.samples)[0]];
				var firstSampleButton = samples.firstElementChild.firstElementChild;

				firstSampleButton.click();
				expect(cm.getValue()).to.equal(firstSample.code);
				expect(graph.innerHTML).to.not.contain("test_marker");
			});


			it("displays exception when bad code entered", function() {
				cm.setValue("asdf");
				evaluate.click();
				expect(graph.innerHTML).to.contain("<pre>ReferenceError");
			});
		});

	});


}());