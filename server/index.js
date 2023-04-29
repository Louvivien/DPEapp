const dotenv = require('dotenv').config()
const express = require('express');
const axios = require('axios');
const cheerio = require("cheerio");
const { performance } = require('perf_hooks');
const cors = require("cors");


const app = express();
const port = process.env.PORT || 5000;



const scrapeGoogleSearch = async (query, address, city) => {
  const startTime = performance.now();
  var randomId = query.slice(0, 2);


  const response = await axios.get(`https://reviewsonmywebsite.com/api/internal/open/googleMaps/autocomplete?query=${query} ${address}`);
  const data = response.data;

  let nameGoogle = null;
  let found = false;

  if (data[0]) {
    if (data[0].main_text) {
      nameGoogle = data[0].main_text.replace(new RegExp(city, "gi"), "");
      const nameGoogleNormalized = nameGoogle.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[0-9]/g, "").toLowerCase().replace(/\s+/g, ' ');
      const queryNormalized = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[0-9]/g, "").toLowerCase().replace(/\s+/g, ' ');
      found = new RegExp(`\\b(${queryNormalized.split(" ").join("|")})\\b`, "gi").test(nameGoogleNormalized);
      console.log(`${randomId}     query`, queryNormalized);
      console.log(`${randomId}     GoogleName`, nameGoogleNormalized);
    }
  }

  console.log(`${randomId}     check`, found);

  let placeId = null;
  let reviewLink = null;
  let rating = null;
  let numberOfReview = null;

  if (found) {
    placeId = data[0].place_id;

    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name%2Crating%2Cuser_ratings_total&key=${process.env.MAPSAPI}`);
    const data2 = response.data;


    if (data2.result) {
      if (data2.result.rating) {
        rating = data2.result.rating;
        reviewLink = `https://search.google.com/local/reviews?placeid=${placeId}`;
        numberOfReview = data2.result.user_ratings_total
      }
    }

  }

  console.log(`${randomId}     placeId`, placeId);
  console.log(`${randomId}     reviewLink`, reviewLink);
  console.log(`${randomId}     rating`, rating);
  console.log(`${randomId}     numberOfReview`, numberOfReview);

  return { placeId, reviewLink, rating, numberOfReview };
}




app.use(cors())

app.get('/api/dpe', async (req, res) => {
  const startTime = performance.now();
  const city = req.query.city;
  const postalCode = req.query.postalcode;
  const professionals = [];
  const promises = [];

  try {
    //Call the API
    const response = await axios.get(`https://diagnostiqueurs.din.developpement-durable.gouv.fr/rechercheCompleteDiagnostiqueur.action?criteres.societe=&d-16544-p=1&criteres.idOc=-1&criteres.region.id=-1&criteres.distance=50&criteres.departement.id=-1&criteres.commune.cp=${postalCode}&criteres.commune.libelle=${city}&action:rechercheCompleteDiagnostiqueur=Voir+la+liste+des+diagnostiqueurs&criteres.idsDomaine=865&criteres.idsDomaine=866&criteres.isRechercheComplete=true`);
    const html = response.data;
    const $ = cheerio.load(html);

    //Get all the different results from the API
    $('.displayTable .odd,.even').each(async function () {

      //Format the phone numbers
      let phone = $(this).find('.infos .tel').text().trim();
      let phoneNumber = phone.match(/\d{10}|\d{2}[. ]\d{2}[. ]\d{2}[. ]\d{2}[. ]\d{2}|\d{2} \d{2} \d{2} \d{2} \d{2}/) ? phone.match(/\d{10}|\d{2}[. ]\d{2}[. ]\d{2}[. ]\d{2}[. ]\d{2}|\d{2} \d{2} \d{2} \d{2} \d{2}/)[0] : "";
      phoneNumber = phoneNumber.replace(/[. ]/g, "").replace(/(\d{2})(?=\d)/g, '$1 '); //replace dots or spaces with space
      //Get the certifications
      const certification = $(this).find('.domaine').text().trim();


      //Get the city for the professional
      const address = $(this).find('.infos .adr').text().trim();
      const regex = /(\d{5})\s([A-Za-z\s]+)/;
      const city = address.match(regex)[2] || "";
      //Get the name and the company
      const name = $(this).find('.identite .nom').text().trim();
      const company = $(this).find('.identite .societe').text().trim();

      const checkpoint1 = (performance.now() - startTime)
      console.log("Loading Time for API info ", checkpoint1.toFixed(2), "ms");


      //Get the Google details
      const searchQuery = company ? `${company}` : `${name}`;
      promises.push(scrapeGoogleSearch(searchQuery, address, city).then((googleResults) => {
        const placeId = googleResults.placeId;
        const reviewLink = googleResults.reviewLink;
        const rating = googleResults.rating;
        const numberOfReview = googleResults.numberOfReview;
        const checkpoint2 = (performance.now() - startTime)
        console.log("Loading Time for Google details ", checkpoint2.toFixed(2), "ms");

        //Get the details 
        const professional = {
          name: name,
          company: company,
          address: address,
          city: city,
          phone: phoneNumber,
          certification: certification,
          placeId: placeId,
          reviewLink: reviewLink,
          rating: rating,
          numberOfReview: numberOfReview,
        };
        professionals.push(professional);

      }));
    });

    await Promise.all(promises);
    res.json(professionals);
    const checkpoint3 = (performance.now() - startTime);
    console.log("Response sent ", checkpoint3.toFixed(2), "ms");



  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



app.listen(port, () => console.log(`Server listening on port ${port}`));

//https://diagnostiqueurs.din.developpement-durable.gouv.fr/rechercheCompleteDiagnostiqueur.action?criteres.societe=&d-16544-p=1&criteres.idOc=-1&criteres.region.id=-1&criteres.distance=50&criteres.departement.id=-1&criteres.commune.cp=38940&criteres.commune.libelle=roybon&action:rechercheCompleteDiagnostiqueur=Voir+la+liste+des+diagnostiqueurs&criteres.idsDomaine=865&criteres.idsDomaine=866&criteres.isRechercheComplete=true


//https://diagnostiqueurs.din.developpement-durable.gouv.fr/rechercheCompleteDiagnostiqueur.action?criteres.societe=&d-16544-p=1&criteres.idOc=-1&criteres.region.id=-1&criteres.distance=50&criteres.departement.id=-1&criteres.commune.cp=75015&criteres.commune.libelle=Paris&action:rechercheCompleteDiagnostiqueur=Voir+la+liste+des+diagnostiqueurs&criteres.idsDomaine=865&criteres.idsDomaine=866&criteres.isRechercheComplete=true



      //Get the number of results
      //const nbResults
      //Get the number of pages
      //const nbPageResults

      //page2
      //https://diagnostiqueurs.din.developpement-durable.gouv.fr/rechercheCompleteDiagnostiqueur.action?criteres.societe=&d-16544-p=2&criteres.idOc=-1&criteres.region.id=-1&criteres.distance=50&criteres.departement.id=-1&criteres.commune.cp=75015&criteres.commune.libelle=Paris&action:rechercheCompleteDiagnostiqueur=Voir+la+liste+des+diagnostiqueurs&criteres.idsDomaine=865&criteres.idsDomaine=866&criteres.isRechercheComplete=true

