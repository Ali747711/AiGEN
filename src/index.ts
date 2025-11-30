
import express from 'express'
import dotenv from 'dotenv'
import {GoogleGenAI, GoogleGenAIOptions} from '@google/genai'
import { marked } from 'marked';
import path from 'path'
import { error } from 'console';
dotenv.config()

const app = express()
const API_KEY = process.env.API_KEY 
const PORT = process.env.PORT || 3003
const ai = new GoogleGenAI({apiKey: API_KEY})


app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Configure marked to be safe and nice
marked.setOptions({
  breaks: true,      // Allow line breaks with single enter
  gfm: true,         // GitHub Flavored Markdown
});

let aiRes:any ;

app.post('/ask', async(req, res) => {
    try {
        const {message} = req.body

        if(!message || message.trim() === ''){
            return res.render('home', {responseHtml: null, userMessage: message, error: 'Please enter a message'})
        }
        
        const reply = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: [{role: 'user', parts: [{text: message}]}]})

        const geminiText = reply.text?.trim() || 'No response from AI'

        //convert Markdown --> HTML
        const responseHtml = marked.parse(geminiText)
        res.render('home', {responseHtml, userMessage: message, error: null})
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.render('home', {responseHtml: null, userMessage: req.body.message || '', error: 'Ai is taking a coffee break. Try again!'})
    }
});


app.get('/', (req, res) => {
    res.render('home', {responseHtml: null, userMessage: null, error: null})
})
app.listen(PORT,  () => {
    console.log(`App is running on PORT: ${PORT}`)
})
