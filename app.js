$(document).ready(function() {

  // DECLARE SOME VARIABLES

  // Get the buttons
  let yummify = $('#yummify');
  let reyummify = $('#reyummify');

  // generate show options search options
  let toggleSearchResults = function() {
    $('#myModal').modal('toggle');
  };

  // set title, year, genre of chosen movie
  let title = '';
  let year = '';
  let genre = '';
  let poster = '';
  let plot = '';

  // API FUNCTIONALITY

  // when press enter in input box, yummify click wil be acitvated
  $('input').keydown(function(event) {
    if (event.keyCode === 13) {
      yummify.trigger('click');
    }
  });

  // when modal is closed (either by x, esc, or by clicking a movie title)
  $('#myModal').on('hidden.bs.modal', function() {
    // remove items from modal list and show placeholder on search bar
    $('.list-group').children().remove();
    $('input').val('');
  });


  // recipe cards tabs FUNCTIONALITY
  $('#ingredientTab').click(function(event) {
    if ($('.ingredientCard').hasClass('hide')) {
      $('#ingredientTab').addClass('active');
      $('#recipeTab').removeClass('active');
      $('.ingredientCard').removeClass('hide');
      $('.recipeCard').addClass('hide');
    }
  });

  $('#recipeTab').click(function(event) {
    if ($('.recipeCard').hasClass('hide')) {
      $('#recipeTab').addClass('active');
      $('#ingredientTab').removeClass('active');
      $('.recipeCard').removeClass('hide');
      $('.ingredientCard').addClass('hide');
    }
  });

  // event listener for yummify and reyummify btns
  yummify.click(event => {
    // get user search
    let userSearch = $('input').val();

    // use omdbapi to get movie data & display array results in modal
    $.ajax({
      method: 'GET',
      url: `http://omdbapi.com/?s=${userSearch}`,
      dataType: 'json',
      success: function(data) {
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
        $('.list-group-item').click(function(event) {

          // display compare section
          $('.compare').show();

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

            },
            error: function() {
              console.log('error');
            },
            async: true
          }).then(function(event) {

            // HERE call RECIPE API

            // matches genre with food types
            let foodMatches = {
              Drama: 'italian',
              Biography: 'pie',
              Western: 'tacos',
              'History': 'steak',
              Adventure: 'BBQ',
              Comedy: 'wings',
              Fantasy: 'pancakes',
              Action: 'burger',
              Documentary: 'pizza',
              Romance: 'pasta',
              Horror: 'finger food',
              Mystery: 'ice cream sundae',
              Thriller: 'salad',
              Animation: 'mac n cheese',
              'Sci-Fi': 'milkshake',
              Sport: 'nachos',
              Crime: 'chinese'
            };

            // getting first genre of movie
            let genreToRecipe = genre.split(', ')[0];

            // variable to hold food type
            let foodType;

            // setting foodType, correcting for undefined genres
            foodMatches[genreToRecipe] === undefined ? foodType = 'italian' : foodType = foodMatches[genreToRecipe]

            $.ajax({
              method: 'GET',
              url: `https://api.edamam.com/search?q=${foodType}&app_id=1e590c2b&app_key=352ccf135e3d4e4ee7d8fb2195038326`,
              dataType: 'json',
              success: function(dataRecipes) {

                $('#ingredientList').children().remove();

                let recipeIndex = Math.floor(Math.random() * dataRecipes['hits'].length);

                console.log(dataRecipes['hits'][recipeIndex]);

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
              error: function() {
                console.log('error');
              }
            })

          })
        });
      },
      error: function() {
        console.log('error');
      }
    }).then(function(event) {
      // console.log("outside ajax call then", poster, title);

    })
  });
});
