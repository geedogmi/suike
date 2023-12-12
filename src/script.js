document.getElementById("openPopup").onclick = function() {
    document.getElementById("popup").style.display = "block";
}

document.getElementsByClassName("close")[0].onclick = function() {
    document.getElementById("popup").style.display = "none";
}

document.getElementById('openPopup').addEventListener('click', () => {
    window.open('http://suike-env.eba-mapunpnt.ap-northeast-2.elasticbeanstalk.com/sub/top.html', '_blank');
});

window.onclick = function(event) {
    if (event.target == document.getElementById("popup")) {
        document.getElementById("popup").style.display = "none";
    }
}

