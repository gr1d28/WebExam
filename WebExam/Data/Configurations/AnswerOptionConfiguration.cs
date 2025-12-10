using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebExam.Models;

namespace WebExam.Data.Configurations
{
    public class AnswerOptionConfiguration : IEntityTypeConfiguration<AnswerOption>
    {
        public void Configure(EntityTypeBuilder<AnswerOption> builder)
        {
            builder.ToTable("AnswerOptions");

            builder.HasKey(ao => ao.Id);

            builder.Property(ao => ao.Text)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(ao => ao.IsCorrect)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(ao => ao.Order)
                .IsRequired(false);

            // Индексы
            builder.HasIndex(ao => ao.QuestionId);
            builder.HasIndex(ao => new { ao.QuestionId, ao.Order });

            // Связи
            builder.HasOne(ao => ao.Question)
                .WithMany(q => q.AnswerOptions)
                .HasForeignKey(ao => ao.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
