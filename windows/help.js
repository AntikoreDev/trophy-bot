const { color } = require('../globals');

class Help {
	constructor(interaction){
		this.interaction = interaction;
		this.page = 0;
	
		this.Run();
	}

	async Run(){
		this.interaction.deferReply();

		this.CreateEmbed();
	}

	async CreateEmbed(){
		const embed = new Discord.MessageEmbed();
		const { text, title } = this.GetPage();

		embed.setColor(color.main);
		embed.setTitle(title);
		embed.setDescription(text);

		this.interaction.editReply({
			embeds: [embed]
		});
	}

	async GetPage(){
		return { text: 'Text', title: 'Title' };
	}
}