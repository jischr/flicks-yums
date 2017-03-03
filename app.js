$(document).ready(function() {
  // DECLARE SOME VARIABLES

  // Get the buttons
  let yummify = $('#yummify');
  let reyummify = $('#reyummify');

  // declare title, year, genre, poster, plot of chosen movie
  let title = '';
  let year = '';
  let genre = '';
  let poster = '';
  var plot = '';

  // variable to hold food type
  let foodType = '';

  // variable to hold plot sentiment
  let movieSentiment = '';

  // MODAL FUNCTIONALITY

  // when modal is closed (either by x, esc, or by clicking a movie title)
  $('#myModal').on('hidden.bs.modal', function() {
    // remove items from modal list and show placeholder on search bar
    $('.list-group').children().remove();
    $('input').val('');
  });

  // generate show options search options
  let toggleSearchResults = function() {
    $('#myModal').modal('toggle');
  };

  // DECLARE SOME FUNCTIONS

  // handle ajax errors
  let ajaxErrorHandler = function(err) {
    console.log('AJAX error', err);
  };

  // matches genre with food types
  let foodMatches = {
    Drama: 'pasta',
    Biography: 'pie',
    Western: 'tacos',
    'History': 'steak',
    Adventure: 'BBQ',
    Comedy: 'wings',
    Fantasy: 'pancakes',
    Action: 'burger',
    Documentary: 'pizza',
    Romance: 'clams',
    Horror: 'finger food',
    Mystery: 'ice cream sundae',
    Thriller: 'salad',
    Animation: 'mac n cheese',
    'Sci-Fi': 'milkshake',
    Sport: 'nachos',
    Crime: 'chinese'
  };

  let handleIngredientTabClick = function(event) {
    if ($('.ingredientCard').hasClass('hide')) {
      $('#ingredientTab').addClass('active');
      $('#recipeTab').removeClass('active');
      $('.ingredientCard').removeClass('hide');
      $('.recipeCard').addClass('hide');
    }
  };

  let handleRecipeTabClick = function(event) {
    if ($('.recipeCard').hasClass('hide')) {
      $('#recipeTab').addClass('active');
      $('#ingredientTab').removeClass('active');
      $('.recipeCard').removeClass('hide');
      $('.ingredientCard').addClass('hide');
    }
  };

  let getRecipe = function(event) {
    // Reset to recipe pg
    handleRecipeTabClick();
    // getting first genre of movie
    let genreToRecipe = genre.split(', ')[0];

    // setting foodType, correcting for undefined genres
    foodMatches[genreToRecipe] === undefined ? foodType = 'italian' : foodType = foodMatches[genreToRecipe];

    $.ajax({
      method: 'GET',
      url: `https://api.edamam.com/search?q=${foodType}&app_id=1e590c2b&app_key=352ccf135e3d4e4ee7d8fb2195038326`,
      dataType: 'json',
      success: function(dataRecipes) {
        $('#ingredientList').children().remove();

        let recipeIndex = Math.floor(Math.random() * dataRecipes['hits'].length);

        let recipe = dataRecipes['hits'][recipeIndex]['recipe'];

        let label = recipe['label'];
        let ingredientLines = recipe['ingredientLines'];
        let source = recipe['source'];
        let calories = recipe['calories'].toFixed(0);
        let healthLabels = recipe['healthLabels'].join(', ');
        let recipeImage = recipe['image'];
        let yields = recipe['yield'];
        let dietLabels = recipe['dietLabels'].join(', ');
        let url = recipe['url'];

        $('#recipeImage').attr("src", recipeImage);
        $('#recipeTitle').text(label);
        $('#recipeSource').text(`From ${source}`);
        $('#recipeBtn').attr("href", url);

        ingredientLines.forEach(ingred => {
          $('#ingredientList').append(
            `<li class="list-group-item">
             ${ingred}
           </li>`);
        });

        $('#calories').text(`Calories: ${calories}`);
        $('#yields').text(`Yield: ${yields}`);
        $('#dietLabels').text(dietLabels);
      },
      error: ajaxErrorHandler
    });
  };

  let handleMoviePosterClick = function(event) {
    // display compare section
    $('.compare').show();
    $('.cuttingboard').show();
    event.preventDefault();

    $('html, body').animate({
      scrollTop: $(".compare").offset().top
    }, 500);

    let id = $(event.target).attr("id");

    $.ajax({
      method: 'GET',
      url: `http://omdbapi.com/?i=${id}&plot=short`,
      dataType: 'json',
      success: function(dataById) {
        // remove present card
        $('#movie').children().remove();

        poster = dataById.Poster;
        title = dataById.Title;
        year = dataById.Year;
        plot = dataById.Plot;
        genre = dataById.Genre;

        $('#movie').append(
          `<div class="card">
           <img class="card-img-top" src=${poster} alt="">
             <div class="card-block">
               <h5>${title} (${year})</h5>
               <p class="card-text">${plot}</p>
             </div>
           </div>`);

        // hide modal
        toggleSearchResults();

        $(function() {
          $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment/",
            beforeSend: function(xhrObj) {
              // Request headers
              xhrObj.setRequestHeader("Content-Type", "application/json");
              xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "644e5ed6f0a9434882158e6b91c70012");
              xhrObj.setRequestHeader("Accept", "application/json");
            },
            type: "POST",
            // Request body
            data: `{
              "documents": [{
                    "language": "en",
                    "id": "1",
                    "text": "${plot}"
                  }
                ]
              }`
          })
          .done(function(dataSentiment) {
            movieSentiment = 1 - dataSentiment['documents'][0]['score'];

            if (movieSentiment < 0.2) {
              $('.face img').attr('src', 'img/faces/1.png');
            }
            else if (movieSentiment < 0.4) {
              $('.face img').attr('src', 'img/faces/3.png');
            }
            else if (movieSentiment < 0.6) {
              $('.face img').attr('src', 'img/faces/5.png');
            }
            else if (movieSentiment < 0.8) {
              $('.face img').attr('src', 'img/faces/7.png');
            }
            else if (movieSentiment < 1) {
              $('.face img').attr('src', 'img/faces/9.png');
            }
          })
          .fail(ajaxErrorHandler);
        });
      },
      error: ajaxErrorHandler,
      async: true
    }).then(getRecipe);
  };

  let handleYummifySuccess = function(data) {
    if (data.Error === 'Movie not found!') {
      $('input').blur();
      $('input').popover('show');
    }
    else {
      let results = [];
      let currentResult = {};

      data.Search.forEach(result => {
        currentResult = {
          title: result.Title,
          year: result.Year,
          id: result.imdbID
        };
        results.push(currentResult);
      });

      results.forEach(show => {
        $('.list-group').append(
          `<li class="list-group-item" id=${show.id}>
         ${show.title} (${show.year})
       </li>`
        );
      });

      // show modal!
      toggleSearchResults();

      // create movie poster card!
      $('.list-group-item').click(handleMoviePosterClick);
    };
  };

  let getSentiment =
  // EVENT LISTENERS

  // listens for input click and hides popover
  $('input').click(function() {
    $('input').popover('hide');
  });

  // listener for ingredientTab click
  $('#ingredientTab').click(handleIngredientTabClick);

  // listener for recipeTab click
  $('#recipeTab').click(handleRecipeTabClick);

  // trigger yummify click with enter key
  $('input').keydown(function(event) {
    if (event.keyCode === 13) {
      yummify.trigger('click');
    }
  });

  // listener for yummify btn
  yummify.click(event => {
    // get user search
    let userSearch = $('input').val();

    // use omdbapi to get movie data & display array results in modal
    $.ajax({
      method: 'GET',
      url: `http://omdbapi.com/?s=${userSearch}`,
      dataType: 'json',
      success: handleYummifySuccess,
      error: ajaxErrorHandler
    });
  });

  // listener for reyummify!
  reyummify.click(event => {
    getRecipe(genre);
  });
});
