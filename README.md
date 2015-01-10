# Interpolis.nl

## Installatie

Installeer de onderstaande tools volgens de instructies:

- [Git](https://mac.github.com)
- [Sketch](http://bohemiancoding.com/sketch/)
- [Sketchtool](http://bohemiancoding.com/sketch/tool/)
- [Node.js](http://nodejs.org)
- [heroku toolbelt](https://toolbelt.heroku.com)
- [Compass](http://compass-style.org/install/) 
- [Susy](http://susydocs.oddbird.net/en/latest/install/)

## Git
Voor versie beheer en collaboratie gebruiken we [Git](http://git-scm.com). Als centrale plek waar we wijzigingen naar toe pushen gebruiken we [Heroku](https://heroku.com). 

Om toegang te krijgen tot de bronbestanden moet je een account bij Heroku hebben. Vraag hiervoor naar Jip of Gijs.

Als je een account hebt, en geautoriseerd bent door Jip of Gijs, kun je de bronbestanden binnenhalen. Open een [Terminal](http://nl.wikipedia.org/wiki/Terminal_Apple) venster, navigeer naar de map waar je de bron wilt downloaden en voer het volgende commando uit:

`heroku git:clone -a siteconcept-dev`

Dit download en installeert de bronbestanden van het prototype.

Voor het prototype hebben we twee versies live staan:

- *siteconcept-dev* de versie die continue wordt bijgewerkt door het design team
- *siteconcept* de versie waar sporadisch een nieuwe versie wordt gezet voor business, realisatie en test teams

Om beide omgevingen te benaderen dien je de volgende commandos in Terminal uit te voeren: 

`git remote rename heroku dev`

Bovenstaande verandert de naam *heroku* naar *dev*.

`heroku git:remote -a siteconcept -r production`

Dit voegt de productie remote toe. Nu kun je op 2 manieren pushen:

`git push dev master`

Dit zet een nieuwe versie live voor het design team en zorgt ervoor dat je teamleden je wijzigingen binnen kunnen halen. 

`git push production master`

Dit zet een nieuwe versie live voor business, ontwikkelaars etc.

Wijzigingen binnenhalen doe je met behulp van het volgende commando:

`git pull dev master`

Ook kun je gebruik maken van de [Github app](https://mac.github.com) om eenvoudigere wijzigingen te synchroniseren.

## Gulp
Gulp wordt gebruikt als tool om SASS te converteren, javascript samen te voegen of een icon font te genereren. 

Dit gebeurt met behulp van Gulp plugins en node modules. Om te zorgen dat Gulp draait moet je eerst een `npm install` uitvoeren in een Terminal venster.

Uit ervaring blijkt dat dit zo nu en dan foutmeldingen kan geven. Zorg ervoor dat je niet op het Achmea Wifi netwerk zit en probeer het een aantal keer.

Het belangrijkste onderdeel van Gulp is het `gulp.js` bestand. Dit bevat de configuratie en scripts. 

### Taken 
Met Gulp zijn een aantal taken uit te voeren.

#### Default
De standaard taak doet het volgende:

- Afbeeldingen worden gekopieerd
- Scripts worden gekopieerd
- Javascript libraries worden via Bower geinstalleerd
- Jade templates worden naar HTML geconverteerd
- SASS wordt met Compass naar CSS geconverteerd
- Een lokale webserver wordt gestart met live sync

Je kunt de taak starten met het commando `gulp`

#### Export-sketch

- Exporteert alle slices uit Sketch bestanden
- Genegeerd een web icon font

Je kunt de taak starten met het commando `gulp export-sketch`

#### Clean

- Verwijdert de volledige `dist` folder

Je kunt de taak starten met het commando `gulp clean`

## Folder structuur

### src
Deze map bevat alle bronbestanden.

- `css`: Alle SASS en CSS bestanden
- `images`: Alle statische afbeeldingen (niet uit Sketch)
- `jade`: Jade templates voor HTML en Javascript (Jade lijkt qua syntax erg veel op HAML)
- `js`: Alle custom javascript
- `sketch`: visual design document en icon font templates

### dist
Deze map bevat uiteindelijk alle gegenereerde HTML, fonts, afbeeldingen en javascript.

## Icon font
De gulp taak `export-sketch` exporteert alle slices. Vervolgen creëert deze een icon font aan de hand van alle SVG bestanden in de `dist/images/icons` folder. Een voorbeeld van de glyphs kan worden gezien door naar de webpagina `http://localhost:3000/fonts/` te openen.