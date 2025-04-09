function getPlayerLevel(xp) {
    var level = 1
    var xpForLevel = Math.round(Math.pow(level, 2.1)) + 10 * level
    while (xp >= xpForLevel) {
        level += 1
        xp -= xpForLevel
        xpForLevel = Math.round(Math.pow(level, 2.1)) + 10 * level
    }

    return [level, xp, xpForLevel]
}

// функция поиска уровня по ID в списке
function getLevelPosition(list, id) {
    for (var i = 0; i < list.length; i++)
        if (id == list[i]["levelID"])
            return i + 1
    
    return 0
}

//старая функция для подсчета очков за уровень
/*
function getLevelPoints(position, verifier) {
    var verifierBonus = 1
    if (Number(position) > 9) {
        let points =  100 / Math.pow((position-9), 0.5)
        if (verifier) {
            return Math.round(points*verifierBonus *100) / 100
        }
        return Math.round(points *100) / 100
    }

    let points = [1000, 900, 800, 700, 600, 
                  500, 400, 300, 200][Number(position) - 1]

    
    if (verifier) {
        return points*verifierBonus
    }
    return points
        
}
*/

//функция для подсчета очков за уровень
function getLevelPoints(levelPosition, verifier, totalLevels) {
    const verifierBonus = 1

    if (levelPosition < 1 || levelPosition > totalLevels) {
        throw new Error("Некорректная позиция уровня.")
    }

    const maxScore = 1000
    const minScore = 1

    const score = Math.round(maxScore - (maxScore - minScore) * Math.pow((levelPosition - 1) / (totalLevels - 1), 0.66));
    
    if (verifier) {
        return score*verifierBonus
    }
    return score
}

// функция выбирает викторов из списка игроков (players) по параметру id - (id уровня)  
function selectPlayersForLevelInfo(players, id) {
    let result = []
    let levels;
    for (let i = 0; i < players.length; i++) {
        levels = players[i]["levels"]
        for (let j = 0; j < levels.length; j++) {
            if (levels[j][0] == id && !levels[j][1]) {
                result.push(players[i]["name"])
            }
        }
    }

    return result
}

// функция добавляет информацию об уровне в пользовательский интерфейс
function addLevelInfoContent(levelData, players, list, globalPlayers) {
    document.getElementsByTagName("body")[0].innerHTML +=  `<div id="info-wrapper"></div>`
    
    let levelPosition = getLevelPosition(list, levelData["levelID"])
    let levelPoints = getLevelPoints(levelPosition, false, list.length)

    let levelInfoContent;
    if (levelData["videoURL"] != false) {
        levelInfoContent = `<button id="info-back-button" onclick="location.reload()"><i class='bx bx-arrow-back'></i></button>
        <div id="level-info">
        <h1>${"#" + levelPosition + " - " + levelData["name"]}</h1>
        <a href="${levelData["videoURL"]}" target="_blank">
            <img src="${levelData["imageURL"]}">
        </a>
        <div class="flex-row-frame flex-wrap-frame">
            <h2><span>Made by</span> ${levelData["creator"]}</h2>
            <h2><span>Verified by</span> ${levelData["verifier"]}</h2>
            <h2><span>points</span> ${levelPoints}</h2>
            <h2 class="copyIdIcon" onclick="copyLevelId(${levelData["levelID"]})">
                <span>ID:</span> ${levelData["levelID"]} <span><i class="bx bx-copy"></i></span></h2>
        </div>
    </div>`
    } else {
        levelInfoContent = `<button id="info-back-button" onclick="location.reload()"><i class='bx bx-arrow-back'></i></button>
        <div id="level-info">
        <h1>${levelData["name"]}</h1>
        <img src="${levelData["imageURL"]}">
        <div class="flex-row-frame flex-wrap-frame">
            <h2><span>Made by</span> ${levelData["creator"]}</h2>
            <h2><span>Verified by</span> ${levelData["verifier"]}</h2>
            <h2><span>points</span> ${levelPoints}</h2>
            <h2 class="copyIdIcon" onclick="copyLevelId(${levelData["levelID"]})">
                ID: ${levelData["levelID"]} <i class="bx bx-copy"></i></h2>
        </div>
    </div>`
    }

    let victorsContent = '';

    for (let i = 0; i < players.length; i++) {
        victorsContent += `<h3 class="victor" onclick="viewPlayerInfo('${players[i]}', 'idk', true)">${players[i]}</h3>`
    }

    victorsContent = `<div id="victors">${victorsContent}</div>`

    document.getElementById("info-wrapper").innerHTML += levelInfoContent + "<h1>Victors</h1>" + victorsContent

}

// функция подгружает информацию об игроках и вызывает addLevelInfoContent
function loadPlayersContent(levelData, id, list) {
    fetch(links["players"])
    .then(players => players.json())
    .then(players => selectPlayersForLevelInfo(players, id))
    .then(players => {
        fetch(links["players"])
        .then(globalPlayers => globalPlayers.json())
        .then(globalPlayers => {
            addLevelInfoContent(levelData, players, list, globalPlayers)
        })
    })
}

// открывает страницу с информацией о демоне
function viewDemonInfo(id, notMainPage) {
    if (notMainPage != undefined) {
        document.getElementById("info-wrapper").remove()
    } else {
        document.getElementById("levels-wrapper").remove()
    }

    fetch(links["demonlist"], {method: "GET"})
    .then(demonlist => demonlist.json())
    .then(demonlist => {
        for (let i = 0; i < demonlist.length; i++) {
            if (demonlist[i]["levelID"] != id) {continue}
            var levelData = demonlist[i]
            break
        }

        loadPlayersContent(levelData, id, demonlist)
    })
}

// открывает страницу с информацией о челлендже
function viewChallengeInfo(id, notMainPage) {
    if (notMainPage != undefined) {
        document.getElementById("info-wrapper").remove()
    } else {
        document.getElementById("levels-wrapper").remove()
    }

    fetch(links["challengelist"], {method: "GET"})
    .then(challengelist => challengelist.json())
    .then(challengelist => {
        for (let i = 0; i < challengelist.length; i++) {
            if (challengelist[i]["levelID"] != id) {continue}
            var levelData = challengelist[i]
            break
        }

        loadPlayersContent(levelData, id, challengelist)
    })
}

function playerInfoCode(name, position, players, demons, challenges) {
    document.getElementsByTagName("body")[0].innerHTML += 
     `<div id="info-wrapper"></div>`
    var wrapper = document.getElementById("info-wrapper")

    var player = ""

    for (var i = 0; i < players.length; i++) {
        if (players[i]["name"] == name) {
            player = players[i]
        }
    }

    player.points = 0

    for (var i = 0; i < player.levels.length; i++) {
        if (getLevelPosition(demons, player.levels[i][0]) != 0) {
            player.points += getLevelPoints(
                getLevelPosition(demons, 
                player.levels[i][0]), 
                player.levels[i][1],
                demons.length)
        } else {
            player.points += getLevelPoints(
                getLevelPosition(challenges, 
                player.levels[i][0]), 
                player.levels[i][1],
                challenges.length)
        }
    }
    
    var playerDemonsList = []
    var playerChallengesList = []

    for (var i = 0; i < player.levels.length; i++) {
        if (getLevelPosition(demons, player.levels[i][0]) != 0) {
            for (var j = 0; j < demons.length; j++) {
                if (demons[j]["levelID"] == player.levels[i][0]) {
                    playerDemonsList.push(demons[j])
                }
            }
        } else {
            for (var j = 0; j < challenges.length; j++) {
                if (challenges[j]["levelID"] == player.levels[i][0]) {
                    playerChallengesList.push(challenges[j])
                }
            }
        }
    }

    var playerDemons = ``
    var playerChallenges = ``

    console.log(playerDemonsList)
    console.log(playerChallengesList)


    for (var i = 0; i < playerDemonsList.length; i++) {
        if (playerDemonsList[i].videoURL != false) {
            var link = `<a class="level-image" href="${playerDemonsList[i].videoURL}" target="_blank"><img src="${playerDemonsList[i].imageURL}" alt=""></a>`
        } else {
            var link = `<div class="level-image"><img src="${playerDemonsList[i].imageURL}" alt=""></div>`
        }

        if (levelIDVisibility) {
            var id = `<h3>ID: ${playerDemonsList[i].levelID}</h3>`
        } else {
            var id = ''
        }

        playerDemons += `<div class="level">${link}
            <div class="level-text" onclick="viewDemonInfo(${playerDemonsList[i].levelID}, true)">
            <h1>#${i+1} - ${playerDemonsList[i].name}</h1><h3>${playerDemonsList[i].creator}</h3>
            ${id}</div></div>`
    }

    for (var i = 0; i < playerChallengesList.length; i++) {
        if (playerChallengesList[i].videoURL != false) {
            var link = `<a class="level-image" href="${playerChallengesList[i].videoURL}" target="_blank"><img src="${playerChallengesList[i].imageURL}" alt=""></a>`
        } else {
            var link = `<div class="level-image"><img src="${playerChallengesList[i].imageURL}" alt=""></div>`
        }

        if (levelIDVisibility) {
            var id = `<h3>ID: ${playerChallengesList[i].levelID}</h3>`
        } else {
            var id = ''
        }

        playerChallenges += `<div class="level">${link}
            <div class="level-text" onclick="viewChallengeInfo(${playerChallengesList[i].levelID}, true)">
            <h1>#${i+1} - ${playerChallengesList[i].name}</h1><h3>${playerChallengesList[i].creator}</h3>
            ${id}</div></div>`
    }

    console.log(playerDemons)
    console.log(playerChallenges)

    var playerLevelClass = ''
    var playerLevel = getPlayerLevel(player.points)
    if (playerLevel[0] < 5) {
        playerLevelClass = `player-level1`
    } else if (playerLevel[0] < 10) {
        playerLevelClass = `player-level2`
    } else if (playerLevel[0] < 15) {
        playerLevelClass = `player-level3`
    } else if (playerLevel[0] < 20) {
        playerLevelClass = `player-level4`
    } else if (playerLevel[0] < 25) {
        playerLevelClass = `player-level5`
    } else {
        playerLevelClass = `player-level6`
    }

    var playerInterface = `
    <button id="info-back-button" onclick="location.reload()"><i class='bx bx-arrow-back'></i></button>
    <div class="player-name">
        <h1>#${position} - ${player.name}</h1>
        <div class="player-xp-info">
            <h3 class="player-level ${playerLevelClass}">level ${playerLevel[0]}</h3>
            <h3>${Math.round(player.points*100)/100} points</h3>
        </div>
        <div id="player-level-bar-frame">
            <div id="player-level-bar"></div>
            ${Math.round(playerLevel[1]*100)/100}/${playerLevel[2]}
        </div>
    </div>
    <div class="player-levels-frame">
        <div class="demons-frame">
            <h1>demons</h1>
            ${playerDemons}
        </div>
        <div class="challenges-frame">
            <h1>challenges</h1>
            ${playerChallenges}
        </div>
    </div>`

    document.querySelector(":root").style.setProperty("--player-level-progress", 
        `${playerLevel[1]/playerLevel[2] * 100}%`)
    wrapper.innerHTML += playerInterface

}

function getChallengelist2(name, position, players, demons) {
    fetch(links["challengelist"])
    .then(challenges => challenges.json())
    .then(challenges => {
        playerInfoCode(name, position, players, demons, challenges)
    })
}

function getDemonlist2(name, position, players) {
    fetch(links["demonlist"])
    .then(demons => demons.json())
    .then(demons => {
        getChallengelist2(name, position, players, demons)
    })
}

// открывает страницу с информацией об игроке
function viewPlayerInfo(name, position, notMainPage) {
    if (notMainPage != undefined) {
        document.getElementById("info-wrapper").remove()
    } else {
        document.getElementById("players-wrapper").remove()
    }
    fetch(links["players"])
    .then(players => players.json())
    .then(players => {
        getDemonlist2(name, position, players)
    })
}