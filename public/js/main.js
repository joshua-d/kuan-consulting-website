var assistant_shown = false;
var hiding_assistant = false;
var assistant_hide_timeout;

function is_mobile() {
    const to_match = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return to_match.some((to_match_item) => {
        return navigator.userAgent.match(to_match_item);
    });
}

function set_mobile_dimensions() {
    let center_col = document.getElementById('center-col');
    center_col.style.width = '90%';
    center_col.style.left = '5%';
    center_col.style.maxWidth = null;

    let header_gif = document.getElementById('header-gif');
    header_gif.style.width = '100%';
    header_gif.style.height = Math.floor(header_gif.clientWidth * 70/285) + 'px';

    document.getElementById('assistant-container').style.visibility = 'hidden';

    for (let img of document.querySelectorAll('#media-list img')) {
        let dim_ratio = img.clientWidth / img.clientHeight;
        img.style.width = '100%';
        img.style.height = Math.floor(img.style.clientWidth * dim_ratio) + 'px';
    }
}

function show_assistant() {
    if (!assistant_shown) {
        document.getElementById('assistant-img').src = "public/img/assistant-gif.gif";
        assistant_shown = true;

        setTimeout(function() {
            let contact_info_container = document.getElementById('contact-info-container');
            contact_info_container.className = 'fade-in';
            contact_info_container.style.visibility = 'visible';
        }, 800);
    }
    if (hiding_assistant) {
        clearTimeout(assistant_hide_timeout);
        hiding_assistant = false;
    }
}

function hide_assistant() {
    if (assistant_shown && !hiding_assistant) {
        hiding_assistant = true;
        assistant_hide_timeout = setTimeout(function() {
            document.getElementById('assistant-img').src = "public/img/assistant-gif-reverse.gif";
            let contact_info_container = document.getElementById('contact-info-container');
            contact_info_container.className = 'fade-out';
            setTimeout(function() {
                document.getElementById('assistant-img').src = "public/img/still-assistant.jpg";
                contact_info_container.style.visibility = 'hidden';
                assistant_shown = false;
                hiding_assistant = false;
            }, 1500);
        }, 3000);
    }
}

function set_listeners() {
    let assistant_container = document.getElementById('assistant-container');
    let contact_info_container = document.getElementById('contact-info-container')
    
    assistant_container.onmouseover = show_assistant;
    assistant_container.onclick = show_assistant;
    assistant_container.onmouseout = hide_assistant;
    
    contact_info_container.onmouseover = show_assistant;
    contact_info_container.onmouseout = hide_assistant;
}

function get_cms_doc_by_type(type, results) {
    for (let item of results) {
        if (item.type === type)
          return item.data;
    }
}

function generate_ps(content, append_div_id, p_class) {
    let append_div = document.getElementById(append_div_id);
    for (let p of content) {
        let p_elem = document.createElement('p');
        p_elem.textContent = p.text;

        if (p_class != null)
            p_elem.className = p_class;

        if (p.spans.length > 0) {
            for (let span of p.spans) {
                if (span.type == 'hyperlink') {
                    p_elem.innerText = p_elem.innerHTML.substring(0, span.end) + '</a>' + p_elem.innerHTML.substring(span.end);
                    p_elem.innerHTML = p_elem.innerText.substring(0, span.start) + '<a href="' + span.data.url + '">' + p_elem.innerText.substring(span.start);
                }
            }
        }

        append_div.appendChild(p_elem);
    }
}

function populate_cms_content() {
    
    fetch('https://gia-kuan-consulting.cdn.prismic.io/api/v2')
    .then(response => response.json())
    .then(function(data) {

        let master_ref = data.refs[0].ref;

        fetch('https://gia-kuan-consulting.cdn.prismic.io/api/v2/documents/search?ref=' + master_ref)
        .then(response => response.json())
        .then(function(data) {

            let media_list_content = get_cms_doc_by_type('homepage_media', data.results).media_list;
            let main_text_content = get_cms_doc_by_type('homepage_main_text', data.results).main_text;
            let left_subtext_content = get_cms_doc_by_type('homepage_left_sub-text', data.results).text;
            let right_subtext_content = get_cms_doc_by_type('homepage_right_sub-text', data.results).text;

            //Populate main text
            generate_ps(main_text_content, 'main-text');

            //Populate media list
            let media_list_div = document.getElementById('media-list');
            for (let media_item of media_list_content) {
                if (Object.keys(media_item.image) != 0) {
                    let img_elem = document.createElement('img');
                    img_elem.className = 'media-item';
                    img_elem.src = media_item.image.url;
                    media_list_div.appendChild(img_elem);
                }
                else if (Object.keys(media_item.video) != 0) {
                    let iframe_elem = document.createElement('iframe');
                    iframe_elem.className = 'media-item';
                    
                    let embed_url = media_item.video.embed_url;
                    if (embed_url.includes('youtube.com')) {
                        let video_id = embed_url.substring(embed_url.indexOf('v=') + 2);
                        embed_url = 'https://www.youtube.com/embed/' + video_id;
                    }
                    
                    iframe_elem.src = embed_url;
                    iframe_elem.style.width = '100%';
                    iframe_elem.onload = () => iframe_elem.style.height = Math.floor(iframe_elem.clientWidth * 9/16) + 'px';
                    media_list_div.appendChild(iframe_elem);
                }
            }

            //TODO Populate sub text
            generate_ps(left_subtext_content, 'sub-text-left', 'sub-text-p');
            generate_ps(right_subtext_content, 'sub-text-right', 'sub-text-p');

          });

    });
    
}


window.onload = function() {
    populate_cms_content();
    set_listeners();
    if (is_mobile()) set_mobile_dimensions();
};
