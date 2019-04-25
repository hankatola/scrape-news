$(document).ready(function() {

  // Function Farm
  let saved = false
  const drawSingleArticle = article => {
    return `<div class="card story ${article._id}" data-id="${article._id}" data-title="${article.title}">
    <h5 class="card-header">${article.title}</h5>
    <div class="card-body">
      <p class="card-text">${article.body}</p>
      <div class="btn btn-primary save-article" data-id="${article._id}" id="${article._id}">${!article.saved && 'Save' || 'Unsave'}</div>
      <a href='${article.link}' class="btn btn-primary" target="_blank">Read at NYT</a>
      <button type="button" class="btn btn-primary" data-id="${article._id}">Comment</button>
    </div>
  </div>`
  }
  const drawSingleNote = note => {
    return `<div class="card w-auto p-3" id="${note._id}">
      <div class="card-body">
        <p class="card-text">${note.body}</p>
        <a href="#" class="btn btn-primary delete-button" data-id="${note._id}">Delete</a>
      </div>
    </div>`
  }
  const queryAndDrawArticles  = (all=true) => {
    // draw article function
    // prepare & draw
    $("#articles").empty()
    const home = $('#home-button')
    const save = $('#save-button')
    const borders = 'border border-light'
    if (!saved) {
      home.addClass(borders)
      save.removeClass(borders)
    } else {
      home.removeClass(borders)
      save.addClass(borders)
    }
    $.getJSON(`/${all && 'articles' || 'savedArticles'}`, articles => {
      for (let i in articles) {
        $("#articles").append(drawSingleArticle(articles[i]))
      }
    })
  }
  const allArticles = () => {
    saved = false
    queryAndDrawArticles()
  }
  const savedArticles = () => {
    saved = true
    queryAndDrawArticles(false)
  }
  function saveArticle() {
    const id = $(this).attr("data-id")
    const btn = $(`#${id}`)
    if (btn.text() === 'Save') {
      btn.text('Unsave')
    } else {
      btn.text('Save')
    }
    // if we're viewing saved articles remove the article after it's unsaved
    saved && $(`.${id}`).remove()
    $.ajax({
      method: "POST",
      url: "/saveArticle/" + id,
    }).then(res => {
    });
  }
  const scrapeArticles = () => {
    $("#articles").empty()
    $.getJSON('/scrape', articles => {
      for (let i in articles){
        $('#articles').append(drawSingleArticle(articles[i]))
      }
    })
  }
  function drawNotes() {
    // draw note function
    // prepare & draw
    const id = $(this).attr('data-id')
    $('#comment-title').attr('data-id',id).text($(this).attr('data-title'))
    $('#notes').empty()
    $.ajax({
      method: "GET",
      url: `/note/${id}`,
    }).then(notes => {
      for (let i in notes) {
        $('#notes').append(drawSingleNote(notes[i]))
      }
    })
  }
  const saveNote = () => {
    const note = $('#comment-text').val()
    const id = $('#comment-title').attr('data-id')
    $.ajax({
      method: "POST",
      url: `/note/${id}`,
      data: {
        body: note
      }
    }).then(res => {
      $('#notes').prepend(drawSingleNote(res))
    })
  }
  function deleteNote() {
    const id = $(this).attr('data-id')
    $(`#${id}`).remove()
    $.ajax({
      method: "POST",
      url: `/deleteNote/${id}`,
    }).then(res => {
    })
  }
  /*TODO: Highlight the 'Home' button when on 'home', and the 'saved' when on saved,
          but use the same page for both, just empty the article section & redraw w/
          saved articles when showing them. All should be on one page.
  */

  // On Clicks
  $(document).on("click", ".story", drawNotes)
  $(document).on("click", ".save-note", saveNote)
  $(document).on("click", ".save-article", saveArticle)
  $(document).on("click", ".get-articles", allArticles)
  $(document).on("click", ".delete-button", deleteNote)
  $(document).on("click", ".get-saved", savedArticles)
  $(document).on("click", ".scrape", scrapeArticles)

  allArticles()
})