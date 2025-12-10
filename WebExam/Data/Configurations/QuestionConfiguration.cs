using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebExam.Models;

namespace WebExam.Data.Configurations
{
    public class QuestionConfiguration : IEntityTypeConfiguration<Question>
    {
        public void Configure(EntityTypeBuilder<Question> builder)
        {
            builder.ToTable("Questions");

            builder.HasKey(q => q.Id);

            builder.Property(q => q.Text)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(q => q.Type)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(q => q.Points)
                .IsRequired()
                .HasDefaultValue(1);

            builder.Property(q => q.Order)
                .IsRequired()
                .HasDefaultValue(0);

            // Индексы
            builder.HasIndex(q => q.ExamId);
            builder.HasIndex(q => new { q.ExamId, q.Order });

            // Связи
            builder.HasOne(q => q.Exam)
                .WithMany(e => e.Questions)
                .HasForeignKey(q => q.ExamId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(q => q.AnswerOptions)
                .WithOne(ao => ao.Question)
                .HasForeignKey(ao => ao.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
