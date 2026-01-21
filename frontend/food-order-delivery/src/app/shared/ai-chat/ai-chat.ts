import { Component, EventEmitter, Output, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-ai-chat',
  standalone: false,
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.css'
})
export class AiChat implements OnInit {

  @Output() close = new EventEmitter<void>();
  @ViewChild('chatEnd') chatEnd!: ElementRef;

  userMessage = '';
  isLoading = false;

  messages: {
    sender: 'user' | 'ai';
    text: string;
  }[] = [];

  predefinedQuestions = [
    'Where is my order?',
    'Why is my order delayed?',
    'Suggest dinner options',
    'Suggest healthy food'
  ];

  customerName = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.customerName = user?.firstName || 'there';

    const chatKey = this.getChatStorageKey();
    const savedChat = localStorage.getItem(chatKey);

    if (savedChat) {
      this.messages = JSON.parse(savedChat);
    } else {
      this.messages = [
        {
          sender: 'ai',
          text: `Hi ${this.customerName}, 👋  
I’m your AI food assistant.  
How can I help you today?  
You can pick an option below or ask me anything about food.`
        }
      ];
      this.saveChat();
    }

    this.scrollLater();
  }

  /* ---------------- SEND MESSAGE ---------------- */

  sendMessage(message?: string): void {
    const text = message || this.userMessage;
    if (!text) return;

    this.messages.push({ sender: 'user', text });
    this.userMessage = '';
    this.isLoading = true;
    this.saveChat();
    this.scrollLater();

    this.authService.askAI(text).subscribe({
      next: res => {
        this.messages.push({
          sender: 'ai',
          text: res.reply
        });
        this.isLoading = false;
        this.saveChat();
        this.scrollLater();
      },
      error: () => {
        this.messages.push({
          sender: 'ai',
          text: 'Sorry, something went wrong. Please try again.'
        });
        this.isLoading = false;
        this.saveChat();
        this.scrollLater();
      }
    });
  }

  /* ---------------- ENTER KEY ---------------- */

  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /* ---------------- CHAT STORAGE ---------------- */

  private getChatStorageKey(): string {
    const user = this.authService.getUser();
    return user
      ? `aiChatHistory_${user.userId}` : 'aiChatHistory_guest';
  }

  private saveChat(): void {
    localStorage.setItem(this.getChatStorageKey(), JSON.stringify(this.messages));
  }

  clearChat(): void {
    localStorage.removeItem(this.getChatStorageKey());
    this.messages = [];
    this.ngOnInit();
  }

  /* ---------------- SCROLL ---------------- */

  private scrollLater(): void {
    setTimeout(() => {
      if (this.chatEnd) {
        this.chatEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  }
}