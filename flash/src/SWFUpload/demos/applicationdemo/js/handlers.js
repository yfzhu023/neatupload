function fileQueued(fileObj) {
	try {
		this.addFileParam(fileObj.id, "file_id", fileObj.id);
		//var progress = new FileProgress(fileObj, this.getSetting("upload_target"));
		//progress.SetStatus("Uploading...");
		//progress.ToggleCancel(true, this);

	} catch (ex) { this.debugMessage(ex); }

}

function fileProgress(fileObj, bytesLoaded) {

	try {
		var percent = Math.ceil((bytesLoaded / fileObj.size) * 100)

		var progress = new FileProgress(fileObj,  this.getSetting("upload_target"));
		progress.SetProgress(percent);
		if (percent === 100) {
			progress.SetStatus("Creating thumbnail...");
			progress.ToggleCancel(false, this);
		} else {
			progress.SetStatus("Uploading...");
			progress.ToggleCancel(true, this);
		}
	} catch (ex) { this.debugMessage(ex); }
}

function fileComplete(fileObj) {
	try {
		AddImage("thumbnail.php?id=" + fileObj.id + "&rnd=" + Math.floor(Math.random()*1000000));

		var progress = new FileProgress(fileObj,  this.getSetting("upload_target"));
		//progress.SetComplete();
		progress.SetStatus("Thumbnail Created.");
		progress.ToggleCancel(false);


	} catch (ex) { this.debugMessage(ex); }
}


function fileCancelled(fileObj) {
	try {
		var progress = new FileProgress(fileObj,  this.getSetting("upload_target"));
		progress.SetCancelled();
		progress.SetStatus("Cancelled");
		progress.ToggleCancel(false);
	}
	catch (ex) { this.debugMessage(ex); }
}

function queueComplete() {
	try {
        var progress = new FileProgress({ name: "Done." },  this.getSetting("upload_target"));
        progress.SetComplete();
        progress.SetStatus("All images received.");
        progress.ToggleCancel(false);
    } catch (ex) { this.debugMessage(ex); }
}

function uploadError(error_code, fileObj, message) {
	try {
		var error_name = "";
		switch(error_code) {
			case SWFUpload.ERROR_CODE_QUEUE_LIMIT_EXCEEDED:
				error_name = "You have attempted to queue too many files.";
			break;
		}

		if (error_name !== "") {
			alert(error_name);
			return;
		}

		switch(error_code) {
			case SWFUpload.ERROR_CODE_ZERO_BYTE_FILE:
				image_name = "zerobyte.gif";
			break;
			case SWFUpload.ERROR_CODE_UPLOAD_LIMIT_EXCEEDED:
				image_name = "uploadlimit.gif";
			break;
			case SWFUpload.ERROR_CODE_FILE_EXCEEDS_SIZE_LIMIT:
				image_name = "toobig.gif";
			break;
			case SWFUpload.ERROR_CODE_HTTP_ERROR:
			case SWFUpload.ERROR_CODE_MISSING_UPLOAD_TARGET:
			case SWFUpload.ERROR_CODE_UPLOAD_FAILED:
			case SWFUpload.ERROR_CODE_IO_ERROR:
			case SWFUpload.ERROR_CODE_SECURITY_ERROR:
			default:
				alert(message);
				image_name = "error.gif";
			break;
		}

		AddImage("images/" + image_name);

	} catch (ex) { this.debugMessage(ex); }

}


/* ******************************************
 *	FileProgress Object
 *	Control object for displaying file info
 * ****************************************** */

function FileProgress(fileObj, target_id) {
	this.file_progress_id = "divFileProgress";

	this.fileProgressWrapper = document.getElementById(this.file_progress_id);
	if (!this.fileProgressWrapper) {
		this.fileProgressWrapper = document.createElement("div");
		this.fileProgressWrapper.className = "progressWrapper";
		this.fileProgressWrapper.id = this.file_progress_id;

		this.fileProgressElement = document.createElement("div");
		this.fileProgressElement.className = "progressContainer";

		var progressCancel = document.createElement("a");
		progressCancel.className = "progressCancel";
		progressCancel.href = "#";
		progressCancel.style.visibility = "hidden";
		progressCancel.appendChild(document.createTextNode(" "));

		var progressText = document.createElement("div");
		progressText.className = "progressName";
		progressText.appendChild(document.createTextNode(fileObj.name));

		var progressBar = document.createElement("div");
		progressBar.className = "progressBarInProgress";

		var progressStatus = document.createElement("div");
		progressStatus.className = "progressBarStatus";
		progressStatus.innerHTML = "&nbsp;";

		this.fileProgressElement.appendChild(progressCancel);
		this.fileProgressElement.appendChild(progressText);
		this.fileProgressElement.appendChild(progressStatus);
		this.fileProgressElement.appendChild(progressBar);

		this.fileProgressWrapper.appendChild(this.fileProgressElement);

		document.getElementById(target_id).appendChild(this.fileProgressWrapper);
		FadeIn(this.fileProgressWrapper, 0);

	} else {
		this.fileProgressElement = this.fileProgressWrapper.firstChild;
		this.fileProgressElement.childNodes[1].firstChild.nodeValue = fileObj.name;
	}

	this.height = this.fileProgressWrapper.offsetHeight;

}
FileProgress.prototype.SetProgress = function(percentage) {
	this.fileProgressElement.className = "progressContainer green";
	this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
	this.fileProgressElement.childNodes[3].style.width = percentage + "%";
}
FileProgress.prototype.SetComplete = function() {
	this.fileProgressElement.className = "progressContainer blue";
	this.fileProgressElement.childNodes[3].className = "progressBarComplete";
	this.fileProgressElement.childNodes[3].style.width = "";

}
FileProgress.prototype.SetError = function() {
	this.fileProgressElement.className = "progressContainer red";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

}
FileProgress.prototype.SetCancelled = function() {
	this.fileProgressElement.className = "progressContainer";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

}
FileProgress.prototype.SetStatus = function(status) {
	this.fileProgressElement.childNodes[2].innerHTML = status;
}

FileProgress.prototype.ToggleCancel = function(show, upload_obj) {
	this.fileProgressElement.childNodes[0].style.visibility = show ? "visible" : "hidden";
	if (upload_obj) {
		var file_id = this.file_progress_id;
		this.fileProgressElement.childNodes[0].onclick = function() { upload_obj.cancelUpload(file_id); return false; };
	}
}

function AddImage(src) {
	var new_img = document.createElement("img");
	new_img.style.margin = "5px";

	document.getElementById("thumbnails").appendChild(new_img);
	if (new_img.filters) {
		try {
			new_img.filters.item("DXImageTransform.Microsoft.Alpha").opacity = 0;
		} catch (e) {
			// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
			new_img.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + 0 + ')';
		}
	} else {
		new_img.style.opacity = 0;
	}

	new_img.onload = function () { FadeIn(new_img, 0); };
	new_img.src = src;
}

function FadeIn(element, opacity) {
	var reduce_opacity_by = 15;
	var rate = 30;	// 15 fps


	if (opacity < 100) {
		opacity += reduce_opacity_by;
		if (opacity > 100) opacity = 100;

		if (element.filters) {
			try {
				element.filters.item("DXImageTransform.Microsoft.Alpha").opacity = opacity;
			} catch (e) {
				// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
				element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + opacity + ')';
			}
		} else {
			element.style.opacity = opacity / 100;
		}
	}

	if (opacity < 100) {
		setTimeout(function() { FadeIn(element, opacity); }, rate);
	}
}
