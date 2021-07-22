//
//
//    This bot was made for Dinyy
//
//

const Json = require('easy-json-database')
const db = new Json('./database.json')

const Discord = require('discord.js')
const client = new Discord.Client()

const tiktok = require('tiktok-scraper')
try {
    const config = require('./config.json')
} catch (error) {
    const config = new Json('./config.json')
    config.set('token', "Enter your bot\'s token here!")
    config.set('notifChannel', 'Enter the ID of the channel the bot will send notifications to')
    config.set('embed_icon_url', 'https://sf-tb-sg.ibytedtos.com/obj/eden-sg/uhtyvueh7nulogpoguhm/tiktok-icon2.png')
    config.set('activities',new Array('Enter the status of the bot', 'It will pick randomly from this list ^^'))
    config.set('tiktokAccounts', new Array('Enter the name of your tiktok account', 'You can use multiple accounts ^^'))
    config.set('colors', new Array('Enter the colors that will show next to the ember'))
    config.set('botPrefix', "Enter the prefix for commands")
    config.set('socialsTitle', "Enter a title for socials command")
    config.set('socialsPicture', "Enter a picture link")
    config.set('socials', new Array(
        { name: 'TikTok:', value: '[Name](Link) \n [[Name](Link) \n [Name](Link))', inline: true },
        { name: 'YouTube:', value: '[Name](Link)', inline: true },
        { name: 'Twitch:', value: '[Name](Link)', inline: true },
        { name: 'Twitter:', value: '[Name](Link)', inline: true },
        { name: 'Instagram:', value: '[Name](Link)', inline: true },
        { name: 'PayPal (Donations):', value: '[Name](Link)', inline: true },
        { name: 'Contact E-Mail:', value: '[email.adress@gmail.com]', inline: true }))
    console.log('Please check the config.json file and edit the values before restarting!')
}
const config = require('./config.json')
const prefix = config.botPrefix

client.login(config.token)
var list = []
for (let index = 0; index < config.colors.length; index++) {
    list[index] = (config.colors[index])
}

const sync = async (userID) => {
    const cache = db.get('cache-' + userID)
    const { collector: newPosts } = await tiktok.user(userID)
    if (newPosts.length === 0) return
    const newPostsSorted = newPosts.sort((a, b) => b.createTime - a.createTime).slice(0, 10)
    if (cache) {
        console.log(1)
        const post = newPostsSorted.filter((post) => !cache.includes(post.id))[0]
        if (post && (post.createTime > ((Date.now() - 24 * 60 * 60 * 1000) / 1000))) {
            var color = list[Math.floor(Math.random() * list.length)];
            console.log(2)

            const author = post.authorMeta.nickName
            const link = post.webVideoUrl
            const embed = new Discord.MessageEmbed()
                .setAuthor(author, client.user.displayAvatarURL())
                .setTitle(post.text)
                .setURL(link)
                .setDescription('Click to the name to get to the video')
                .setThumbnail(config.embed_icon_url)
                .setImage(post.covers.default)
                .setColor(color)
                .setTimestamp()
            if (!post.text > 0) embed.setTitle('Click Here')
            channel = client.channels.cache.get(config.notifChannel)
            channel.send(embed)
            channel.send('@everyone')

        }
    }
    db.set('cache-' + userID, newPostsSorted.map((post) => post.id))
    console.log('Finished')
}

const notifications = async () => {
    for (let i = 0; i < config.tiktokAccounts.length; i++) {
        const resolveID = async () => (await tiktok.getUserProfileInfo(config.tiktokAccounts[i])).user.id
        const userID = await resolveID()
        sync(userID)
    }
}

client.on('ready', async () => {

    client.user.setActivity(config.activities[Math.floor(Math.random() * config.activities.length)], {
        type: 'WATCHING',
    })

    setInterval(() => client.user.setActivity(config.activities[Math.floor(Math.random() * config.activities.length)], {
        type: 'WATCHING',
    }), 240 * 1000)
    notifications()
    setInterval(() => notifications(), 120 * 1000)
})

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'socials' || command === 'social') {
        var color = list[Math.floor(Math.random() * list.length)];
        const embed = new Discord.MessageEmbed()
            .setTitle(config.socialsTitle)
            .setThumbnail(config.socialsPicture)
            .setColor(color)
            .addFields(
                config.socials
            )
        message.channel.send(embed)
    }
})