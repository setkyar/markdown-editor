var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
window.saveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;

var hashto;

// Because highlight.js is a bit awkward at times
var languageOverrides = { js: 'javascript',html: 'xml'}
marked.setOptions({
    highlight: function(code, lang) {
        if (languageOverrides[lang]) lang = languageOverrides[lang];
        return hljs.LANGUAGES[lang] ? hljs.highlight(lang, code).value : code;
    }
});

function update(e) {
    var val = e.getValue();

    setOutput(val);

    clearTimeout(hashto);
    hashto = setTimeout(updateHash, 1000);
}

function setOutput(val) {
    val = val.replace(/<equation>((.*?\n)*?.*?)<\/equation>/ig, function(a, b) {
        return '<img src="http://latex.codecogs.com/png.latex?' + encodeURIComponent(b) + '" />';
    });

    document.getElementById('out').innerHTML = marked(val);
}
var editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    mode: 'gfm',
    lineNumbers: true,
    matchBrackets: true,
    lineWrapping: true,
    theme: 'default',
    onChange: update
});
document.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var theFile = e.dataTransfer.files[0];
    var theReader = new FileReader();
    theReader.onload = function(e) {
        editor.setValue(e.target.result);
    };

    theReader.readAsText(theFile);
}, false);

function updateHash() {
    window.location.hash = btoa(RawDeflate.deflate(unescape(encodeURIComponent(editor.getValue()))))
}

if (window.location.hash) {
    var h = window.location.hash.replace(/^#/, '');
    if (h.slice(0, 5) == 'view:') {
        setOutput(decodeURIComponent(escape(RawDeflate.inflate(atob(h.slice(5))))));
        document.body.className = 'view';
    } else {
        editor.setValue(decodeURIComponent(escape(RawDeflate.inflate(atob(h)))))
        update(editor);
        editor.focus();
    }
} else {
    update(editor);
    editor.focus();
}

//When user try to save us markdown
function saveMarkdown() {
    var code = editor.getValue();
    var blob = new Blob([code], {
        type: 'text/plain'
    });
    saveBlob(blob);
}

/**
* Get what user type on blob and save()
* 
* @param blob 
*/
function saveBlob(blob) {
    var name = "untitled.md";
    if (window.saveAs) {
        window.saveAs(blob, name);
    } else if (navigator.saveBlob) {
        navigator.saveBlob(blob, name);
    } else {
        url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", name);
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent(event);
    }
}

//When user try to save us pdf
function savePDF() { 
    if (navigator.userAgent.indexOf("Chrome") != -1) {
        var newWindow = window.open();
        newWindow.document.write(document.getElementById("out").innerHTML);
        newWindow.print();
        newWindow.close();
    };

    console.log('We are now currently support chrome only. Because of Myanmar font rendering problem');
}

//Detact, when user click on Ctrl + S
document.addEventListener('keydown', function(e) {
    if (e.keyCode == 83 && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        saveMarkdown();   //Save Markdown
        return false;
    }
})

//Detact, when user click on Ctrl + P
document.addEventListener('keydown', function(e) {
    if (e.keyCode === 80 && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        savePDF();      //Save PDF
        return false;
    };
});

//When user want to download Markdown file
var markdown = document.getElementById('download-markdown');
markdown.addEventListener('click', function() {
    saveMarkdown();
}, false);

//When user want to download PDF file
var pdf = document.getElementById('download-pdf');
pdf.addEventListener('click', function() {
    savePDF();
}, false);